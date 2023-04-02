import { Allocator } from '../allocator'
import { IAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeViewConstructor, TypedArray } from '../data-type'

export class Primitive implements IAllocatorStructure {
  public static readonly byteLength = 8
  public readonly byteLength: number
  public readonly ptr: IPtrAccessor
  private _heapView!: TypedArray

  constructor(
    private readonly _allocator: Allocator,
    private readonly _dataType: DataType,
    private readonly _dataSize = 8,
  ) {
    this.byteLength = _dataSize
    this.ptr = this._allocator.createPtr()
    this.allocate()
  }

  public get value(): number {
    return this._heapView[0]
  }

  public set value(value: number) {
    this._heapView[0] = value
  }

  private allocateInternal(): void {
    try {
      this._heapView = new DataTypeViewConstructor[this._dataType](this._allocator.heap, this.ptr.value, 1)
    }
     catch (e) {
       debugger
       throw e
     }
  }

  public transfer(heap: ArrayBuffer): void {
    this.allocateInternal()
  }

  private allocate() {
    this.ptr.value = this._allocator.allocate(this.byteLength)
    this.allocateInternal()
  }
}