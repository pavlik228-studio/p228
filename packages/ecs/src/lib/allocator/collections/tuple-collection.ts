import { Allocator } from '../allocator'
import { ILazyAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeSize, DataTypeViewConstructor, TypedArray } from '../data-type'
import { PrimitiveLazy } from '../misc/primitive-lazy'

export class TupleCollection implements ILazyAllocatorStructure {
  public readonly ptr: IPtrAccessor
  private _heapView!: TypedArray
  private readonly _size: PrimitiveLazy
  private readonly _length: PrimitiveLazy
  private readonly _collectionOffset: number
  private readonly _dataBuffer: Array<number>

  constructor(
    private readonly _allocator: Allocator,
    private readonly _tupleSize: number,
    private readonly _initialSize: number,
    private readonly _dataType = DataType.u32,
  ) {
    this.ptr = this._allocator.createRef()
    this._size = new PrimitiveLazy(0, DataType.u32, DataTypeSize[DataType.u32])
    this._length = new PrimitiveLazy(this._size.byteLength, DataType.u32, DataTypeSize[DataType.u32])
    this._collectionOffset = this._length.byteLength + this._length.byteLength
    this._dataBuffer = new Array(this._tupleSize).fill(0)
    this._byteLength = TupleCollection.calculateByteLength(_initialSize, this._tupleSize, this._dataType)
  }

  private _byteLength = 0

  public get byteLength(): number {
    return this._byteLength
  }

  public get length(): number {
    return this._length.value
  }

  public get size(): number {
    return this._size.value
  }

  public static calculateByteLength(collectionSize: number, tupleSize: number, dataType: DataType): number {
    return collectionSize * tupleSize * DataTypeSize[dataType] + DataTypeSize[DataType.u32] * 2
  }

  public get(index: number): number[] | undefined {
    if (index >= this._length.value) return undefined

    const offset = index * this._tupleSize
    for (let i = 0; i < this._tupleSize; i++) {
      this._dataBuffer[i] = this._heapView[offset + i]
    }

    return this._dataBuffer
  }

  public set(index: number, values: number[]): void {
    if (index >= this._length.value) throw new Error('Index out of bounds')

    const offset = index * this._tupleSize
    for (let i = 0; i < this._tupleSize; i++) {
      this._heapView[offset + i] = values[i]
    }
  }

  public add(values: number[]): void {
    const index = this._length.value
    const size = this._size.value

    if (index >= size) this.resize(size * 2)

    const offset = index * this._tupleSize
    for (let i = 0; i < this._tupleSize; i++) {
      this._heapView[offset + i] = values[i]
    }

    this._length.value = index + 1
  }

  public remove(index: number): void {
    const length = this._length.value

    if (index >= length) return

    this._length.value = length - 1

    const lastIndex = length - 1

    if (index === lastIndex) return

    const offset = index * this._tupleSize
    const copyStart = offset + this._tupleSize
    const copyEnd = length * this._tupleSize

    this._heapView.copyWithin(offset, copyStart, copyEnd)
    this._length.value = length - 1
  }

  public insertBefore(index: number, values: number[]): void {
    const length = this._length.value

    if (index >= length) return

    const offset = index * this._tupleSize
    const copyStart = offset + this._tupleSize
    const copyEnd = length * this._tupleSize

    this._heapView.copyWithin(copyStart, offset, copyEnd)
    this.set(index, values)

    this._length.value = length + 1
  }

  public find(predicate: (value: number) => boolean, dataIndex: number): Array<number> | undefined {
    const length = this._length.value

    for (let i = 0; i < length; i++) {
      const value = this.get(i)
      if (predicate(value![dataIndex])) return value!
    }

    return undefined
  }

  public findIndex(predicate: (value: number) => boolean, dataIndex: number): number {
    const length = this._length.value

    for (let i = 0; i < length; i++) {
      const value = this.get(i)
      if (predicate(value![dataIndex])) return i
    }

    return -1
  }

  public indexOf(value: number, dataIndex: number): number {
    const length = this._length.value

    for (let i = 0; i < length; i++) {
      const data = this.get(i)
      if (data![dataIndex] === value) return i
    }

    return -1
  }

  public allocate(heap: ArrayBuffer, ptr: number): this {
    this.internalAllocate(heap, ptr, this._initialSize)
    this._size.value = this._initialSize
    this._byteLength = TupleCollection.calculateByteLength(this._size.value, this._tupleSize, this._dataType)

    return this
  }

  public transfer(heap: ArrayBuffer): void {
    this.internalAllocate(heap, this.ptr.value)
    this._byteLength = TupleCollection.calculateByteLength(this._size.value, this._tupleSize, this._dataType)
  }

  public resize(newSize: number): void {14
    const oldRef = this.ptr.value
    const oldLength = this._length.value
    const newRef = this._allocator.allocate(this._byteLength)
    const oldHeap = this._heapView

    this.internalAllocate(this._allocator.heap, newRef, newSize)

    this._heapView.set(oldHeap)
    this._size.value = newSize
    this._length.value = oldLength
    this.ptr.value = newRef
    this._allocator.free(oldRef)
    this._byteLength = TupleCollection.calculateByteLength(this._size.value, this._tupleSize, this._dataType)
  }

  public toJSON(): number[][] {
    const result: number[][] = []

    for (let i = 0; i < this._length.value; i++) {
      result.push([ ...this.get(i)! ])
    }

    return result
  }

  private internalAllocate(heap: ArrayBuffer, ptr: number, size?: number): void {
    this.ptr.value = ptr
    this._size.allocate(ptr, heap)
    this._length.allocate(ptr, heap)
    size = (size ?? this._size.value) * 2
    this._heapView = new DataTypeViewConstructor[this._dataType](heap, ptr + this._collectionOffset, size)
  }
}