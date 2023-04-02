import { Logger } from '../misc/logger'
import {
  DropFirst,
  IAllocatorStructure,
  ILazyAllocatorStructure,
  ILazyStructConstructor,
  IPtrAccessor,
} from './allocator.types'
import { TupleCollection } from './collections/tuple-collection'
import { DataType } from './data-type'
import { MEM_BLOCK_BUFFER_1, MEM_BLOCK_BUFFER_2, MemoryBlock } from './misc/memory-block'
import { Registry } from './registry'

export class Allocator {
  private readonly _registry: Registry
  private readonly _freeMemList: TupleCollection
  private readonly _usedMemList: TupleCollection
  private readonly _structures = new Array<IAllocatorStructure>()
  private readonly _lazyStructures = new Array<ILazyAllocatorStructure>()

  constructor(
    private _byteLength: number,
    private readonly _memoryBlocks = 16,
    private readonly _registrySize = 16,
  ) {
    this._memoryBlocks = Math.max(Math.ceil(_memoryBlocks / 8) * 8, 16)
    this._registrySize = Math.max(Math.ceil(_registrySize / 8) * 8, 16)
    this._heap = new ArrayBuffer(this._byteLength + this.calculateInternalsSize(this._memoryBlocks, this._registrySize))
    this._registry = new Registry(this._heap, this._registrySize)
    let offset = Registry.calculateSize(this._registrySize)
    this._freeMemList = new TupleCollection(this, 2, this._memoryBlocks).allocate(this._heap, offset)
    offset += this._freeMemList.byteLength
    this._usedMemList = new TupleCollection(this, 2, this._memoryBlocks).allocate(this._heap, offset)
    offset += this._usedMemList.byteLength

    this._freeMemList.add(MEM_BLOCK_BUFFER_1.set(this._byteLength, offset).toRaw())
    this._usedMemList.add(MEM_BLOCK_BUFFER_1.set(this._freeMemList.byteLength, this._freeMemList.ptr.value).toRaw())
    this._usedMemList.add(MEM_BLOCK_BUFFER_1.set(this._usedMemList.byteLength, this._usedMemList.ptr.value).toRaw())

    this._lazyStructures.push(this._freeMemList, this._usedMemList)
    Logger.log(`[Allocator] initialized`, this._heap.byteLength, this._memoryBlocks, this._registrySize)
  }

  private _heap!: ArrayBuffer

  public get heap(): ArrayBuffer {
    return this._heap
  }

  public allocate(byteLength: number, reset = true): number {
    // byteLength should be a multiple of 8
    byteLength = Math.ceil(byteLength / 8) * 8
    let block = this.findFreeBlock(byteLength)
    if (!block) {
      // throw new Error('Out of memory')
      this.resize(this._heap.byteLength * 2)
      return this.allocate(byteLength, reset)
    }

    const ptr = block.byteOffset
    const blockIndex = this._freeMemList.indexOf(block.byteOffset, 1)

    if (block.byteLength === byteLength) {
      // block fits exactly, remove from free list
      this._freeMemList.remove(blockIndex)
    } else {
      // block is larger than requested, split and add remaining to free list
      const newBlock = MEM_BLOCK_BUFFER_1.set(
        block.byteLength - byteLength,
        ptr + byteLength,
      )
      this._freeMemList.set(blockIndex, newBlock.toRaw())
    }

    this._usedMemList.add(MEM_BLOCK_BUFFER_1.set(byteLength, ptr).toRaw())

    if (!reset) return ptr

    // Reset allocated memory to 0
    new Uint8Array(this._heap, ptr, byteLength).fill(0)

    return ptr
  }

  public free(ptr: number): void {
    const block = this.findUsedBlock(ptr)

    if (!block) throw new Error(`Invalid address ${ptr}`)

    Logger.log(`[Allocator] free:`, ptr, block.byteLength)

    const blockIndex = this._usedMemList.indexOf(block.byteOffset, 1)

    this._usedMemList.remove(blockIndex)
    this.addFreeBlock(block)
  }

  public createSnapshot(): ArrayBuffer {
    return this._heap.slice(0, this._byteLength)
  }

  public applySnapshot(snapshot: ArrayBuffer): void {
    this._registry.transfer(snapshot)

    for (const structure of this._structures) structure.transfer(snapshot)
    for (const structure of this._lazyStructures) structure.transfer(snapshot)

    this._heap = snapshot
  }

  public createPtr(): IPtrAccessor {
    return this._registry.create()
  }

  public allocateStruct<
    TConstructor extends new (...args: any[]) => IAllocatorStructure,
    TStruct extends IAllocatorStructure,
  >(Struct: TConstructor, ...args: DropFirst<ConstructorParameters<TConstructor>>): InstanceType<TConstructor> {
    const struct = new Struct(this, ...args)
    this._structures.push(struct)

    Logger.log(`[Allocator] alloateStruct: ${struct.constructor.name}`, struct.ptr.value, struct.byteLength)

    return struct as InstanceType<TConstructor>
  }

  public allocateLazyStruct<
    TConstructor extends ILazyStructConstructor<TStruct>,
    TStruct extends ILazyAllocatorStructure,
  >(Struct: TConstructor, ...args: DropFirst<ConstructorParameters<TConstructor>>): InstanceType<TConstructor> {
    const struct = new Struct(this, ...args)
    this._lazyStructures.push(struct)
    const ptr = this.allocate(struct.byteLength, true)
    struct.ptr.value = ptr
    struct.allocate(this._heap, ptr)

    return struct as InstanceType<TConstructor>
  }

  private resize(newByteLength: number) {
    Logger.log(`[Allocator] resize: ${this._heap.byteLength} -> ${newByteLength}`)
    const oldByteLength = this._heap.byteLength
    const byteLengthDiff = newByteLength - oldByteLength
    const newHeap = new ArrayBuffer(newByteLength)
    const newHeapView = new Uint8Array(newHeap)

    newHeapView.set(new Uint8Array(this._heap))

    for (const structure of this._structures) structure.transfer(newHeap)
    for (const structure of this._lazyStructures) structure.transfer(newHeap)

    this._heap = newHeap
    this.addFreeBlock(MEM_BLOCK_BUFFER_1.set(byteLengthDiff, oldByteLength))
  }

  private calculateInternalsSize(memoryBlocks: number, registrySize: number): number {
    return Registry.calculateSize(registrySize)
      + TupleCollection.calculateByteLength(memoryBlocks, 2, DataType.u32) * 2
  }

  private findFreeBlock(size: number): MemoryBlock | undefined {
    const raw = this._freeMemList.find((blockSize) => blockSize >= size, 0)

    return raw ? MEM_BLOCK_BUFFER_1.fromRaw(raw) : undefined
  }

  private findUsedBlock(addr: number): MemoryBlock | undefined {
    const raw = this._usedMemList.find((blockOffset) => blockOffset === addr, 1)

    return raw ? MEM_BLOCK_BUFFER_1.fromRaw(raw) : undefined
  }

  private addFreeBlock(block: MemoryBlock): void {
    // find the index where the block should be inserted based on address order
    const index = this._freeMemList.findIndex(
      (blockOffset) => blockOffset > block.byteOffset,
      1,
    )
    if (index === -1) {
      // block should be inserted at end of list
      this._freeMemList.add(block.toRaw())
    } else {
      // block should be inserted before the block at the found index
      this._freeMemList.insertBefore(index, block.toRaw())
    }

    // merge adjacent free blocks if possible
    for (let i = 0; i < this._freeMemList.length - 1; i++) {
      const curr = MEM_BLOCK_BUFFER_1.fromRaw(this._freeMemList.get(i)!)
      const next = MEM_BLOCK_BUFFER_2.fromRaw(this._freeMemList.get(i + 1)!)
      if (curr.byteOffset + curr.byteLength === next.byteOffset) {
        curr.byteLength += next.byteLength
        this._freeMemList.set(i, curr.toRaw())
        this._freeMemList.remove(i + 1)
        i--
      }
    }
  }
}