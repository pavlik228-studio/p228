import { Allocator } from '../allocator'
import { IAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeSize, DataTypeViewConstructor, TypedArray } from '../data-type'
import { PrimitiveLazy } from '../misc/primitive-lazy'

export class List implements IAllocatorStructure {
  private _byteLength: number
  private _heapView!: TypedArray
  private readonly _ptr: IPtrAccessor
  private readonly _size: PrimitiveLazy
  private readonly _length: PrimitiveLazy
  private readonly _collectionOffset: number

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

  constructor(
    private readonly _allocator: Allocator,
    private readonly _initialSize: number,
    private readonly _dataType = DataType.u32,
  ) {
    this._ptr = this._allocator.createRef()
    let offset = 0
    this._size = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._size.byteLength
    this._length = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._length.byteLength
    this._collectionOffset = offset
    this._byteLength = List.calculateByteLength(_initialSize, this._dataType)
    this.allocate()
  }

  public add(value: number): void {
    const index = this._length.value

    if (index >= this._size.value) this.resize(this._size.value * 2)

    this._heapView[index] = value
    this._length.value = index + 1
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

  public *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this._length.value; i++) {
      yield this._heapView[i]
    }
  }

  private allocateInternal(heap: ArrayBuffer, size?: number): void {
    const ptr = this._ptr.value
    let offset = 0
    this._size.allocate(ptr, heap)
    offset += this._size.byteLength
    this._length.allocate(ptr, heap)
    offset += this._length.byteLength
    size = List.calculateByteLength(size ?? this._size.value, this._dataType)
    this._heapView = new DataTypeViewConstructor[this._dataType](heap, ptr + offset, size)
  }

  private allocate(): void {
    this._byteLength = List.calculateByteLength(this._initialSize, this._dataType)
    this._ptr.value = this._allocator.allocate(this._byteLength)
    this.allocateInternal(this._allocator.heap, this._initialSize)
    this._size.value = this._initialSize
  }

  private resize(newSize: number): void {
    const oldHeapView = this._heapView
    this._byteLength = List.calculateByteLength(newSize, this._dataType)
    this._ptr.value = this._allocator.allocate(this._byteLength)
    this.allocateInternal(this._allocator.heap, newSize)
    this._heapView.set(oldHeapView)
    this._size.value = newSize
  }

  public transfer(heap: ArrayBuffer): void {
    this.allocateInternal(heap)
    this._byteLength = List.calculateByteLength(this._size.value, this._dataType)
  }

  public static calculateByteLength(collectionSize: number, dataType: DataType): number {
    return collectionSize * DataTypeSize[dataType] + DataTypeSize[DataType.u32] * 2
  }
}