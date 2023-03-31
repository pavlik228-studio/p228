import { Allocator } from '../allocator'
import { IAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeSize, DataTypeViewConstructor, TypedArray } from '../data-type'

export class Array implements IAllocatorStructure {
  public readonly byteLength: number
  private _heapView!: TypedArray
  private readonly _ptr: IPtrAccessor

  constructor(
    private readonly _allocator: Allocator,
    private readonly _size: number,
    private readonly _dataType = DataType.u32,
    private readonly _initialValue = 0,
  ) {
    this._ptr = this._allocator.createPtr()
    this.byteLength = Array.calculateByteLength(_size, this._dataType)
    this.allocate()
  }

  public get ptr(): IPtrAccessor {
    return this._ptr
  }

  public set(index: number, value: number): void {
    if (index >= this._size) throw new Error(`Index ${index} is out of bounds`)
    this._heapView[index] = value
  }

  public get(index: number): number {
    if (index >= this._size) throw new Error(`Index ${index} is out of bounds`)
    return this._heapView[index]
  }

  public static calculateByteLength(size: number, dataType: DataType) {
    return size * DataTypeSize[dataType]
  }

  public transfer(heap: ArrayBuffer): void {
    this.allocateInternal(heap)
  }

  private allocateInternal(heap: ArrayBuffer): void {
    this._heapView = new (DataTypeViewConstructor[this._dataType])(heap, this._ptr.value, this._size)
  }

  private allocate() {
    this._ptr.value = this._allocator.allocate(this.byteLength)
    this.allocateInternal(this._allocator.heap)
    if (this._initialValue !== 0) {
      this._heapView.fill(this._initialValue)
    }
  }
}