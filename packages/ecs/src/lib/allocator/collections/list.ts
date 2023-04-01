import { Logger } from '../../misc/logger'
import { Allocator } from '../allocator'
import { IAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeSize, DataTypeViewConstructor, TypedArray } from '../data-type'
import { PrimitiveLazy } from '../misc/primitive-lazy'

export class List implements IAllocatorStructure {
  private _heapView!: TypedArray
  private readonly _ptr: IPtrAccessor
  private readonly _size: PrimitiveLazy
  private readonly _length: PrimitiveLazy
  private readonly _collectionOffset: number

  constructor(
    private readonly _allocator: Allocator,
    private readonly _initialSize: number,
    private readonly _dataType = DataType.u32,
  ) {
    this._ptr = this._allocator.createPtr()
    let offset = 0
    this._size = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._size.byteLength
    this._length = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._length.byteLength
    this._collectionOffset = offset
    this._byteLength = List.calculateByteLength(_initialSize, this._dataType)
    this.allocate()
  }

  private _byteLength: number

  public get byteLength(): number {
    return this._byteLength
  }

  public get length(): number {
    return this._length.value
  }

  public get size(): number {
    return this._size.value
  }

  public get ptr(): IPtrAccessor {
    return this._ptr
  }

  public static calculateByteLength(collectionSize: number, dataType: DataType): number {
    return collectionSize * DataTypeSize[dataType] + DataTypeSize[DataType.u32] * 2
  }

  public add(value: number): number {
    const index = this._length.value

    if (index >= this._size.value) this.resize(this._size.value * 2)

    this._heapView[index] = value
    this._length.value = index + 1

    return index
  }

  public remove(index: number): void {
    const last = this._length.value - 1
    this._heapView[index] = this._heapView[last]
    this._length.value = last
  }

  public get(index: number): number | undefined {
    if (index >= this._length.value) return undefined
    return this._heapView[index]
  }

  public shift(): number | undefined {
    if (this._length.value === 0) return undefined
    const value = this._heapView[0]
    this.remove(0)

    return value
  }

  public pop(): number | undefined {
    if (this._length.value === 0) return undefined
    const value = this._heapView[this._length.value - 1]
    this.remove(this._length.value - 1)

    return value
  }

  public* [Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this._length.value; i++) {
      yield this._heapView[i]
    }
  }

  public transfer(heap: ArrayBuffer): void {
    this.allocateInternal(heap)
    this._byteLength = List.calculateByteLength(this._size.value, this._dataType)
  }

  public indexOf(value: number): number {
    for (let i = 0; i < this._length.value; i++) {
      if (this._heapView[i] === value) return i
    }

    return -1
  }

  private allocateInternal(heap: ArrayBuffer, size?: number): void {
    const ptr = this._ptr.value
    let offset = 0
    this._size.allocate(ptr, heap)
    offset += this._size.byteLength
    this._length.allocate(ptr, heap)
    offset += this._length.byteLength
    size = size ?? this._size.value
    this._heapView = new DataTypeViewConstructor[this._dataType](heap, ptr + offset, size)
  }

  private allocate(): void {
    this._byteLength = List.calculateByteLength(this._initialSize, this._dataType)
    this._ptr.value = this._allocator.allocate(this._byteLength)
    this.allocateInternal(this._allocator.heap, this._initialSize)
    this._size.value = this._initialSize
  }

  private resize(newSize: number): void {
    const oldPr = this._ptr.value
    const oldLength = this._length.value
    const oldHeapView = this._heapView
    this._byteLength = List.calculateByteLength(newSize, this._dataType)
    this._ptr.value = this._allocator.allocate(this._byteLength)
    Logger.log(`[List] resize:`, this._ptr.value, this._byteLength)
    this.allocateInternal(this._allocator.heap, newSize)
    this._heapView.set(oldHeapView)
    this._size.value = newSize
    this._length.value = oldLength
    this._allocator.free(oldPr)
  }
}