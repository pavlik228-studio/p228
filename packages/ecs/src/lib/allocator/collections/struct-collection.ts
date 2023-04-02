import { createComponentDataAccessor } from '../../components/create-data-acessor'
import {
  IComponentDataAccessor,
  IComponentDataAccessorInternal,
  IComponentInternal,
  IComponentSchema,
} from '../../components/types'
import { Logger } from '../../misc/logger'
import { Allocator } from '../allocator'
import { IAllocatorStructure, IPtrAccessor } from '../allocator.types'
import { DataType, DataTypeSize } from '../data-type'
import { PrimitiveLazy } from '../misc/primitive-lazy'

export class StructCollection<TSchema extends IComponentSchema = IComponentSchema> implements IAllocatorStructure {
  public readonly ptr: IPtrAccessor
  private _dataView!: DataView
  private readonly _collectionOffset: number
  private readonly _length: PrimitiveLazy
  private readonly _size: PrimitiveLazy
  private _componentDataAccessor!: IComponentDataAccessorInternal<TSchema>

  constructor(
    private readonly _allocator: Allocator,
    private readonly _initialSize: number,
    private readonly _struct: IComponentInternal<TSchema>,
  ) {
    this.ptr = this._allocator.createPtr()

    let offset = 0
    this._size = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._size.byteLength
    this._length = new PrimitiveLazy(offset, DataType.u32, DataTypeSize[DataType.u32])
    offset += this._length.byteLength
    this._collectionOffset = offset
    this._byteLength = StructCollection.calculateByteLength(_initialSize, _struct.__BYTE_LENGTH)
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

  public static calculateByteLength(size: number, structByteLength: number) {
    return structByteLength * size + DataTypeSize[DataType.u32] * 2
  }

  public add(): number {
    const index = this._length.value

    if (index >= this._size.value) this.resize(this._size.value * 2)

    this._length.value = index + 1

    return index
  }

  public get(index: number): IComponentDataAccessor<TSchema> {
    this._componentDataAccessor.__INDEX = index
    return this._componentDataAccessor
  }

  public transfer(heap: ArrayBuffer): void {
    this.allocateInternal(heap)
    this._byteLength = StructCollection.calculateByteLength(this._size.value, this._struct.__BYTE_LENGTH)
  }

  public resetForIndex(index: number) {
    const byteLength = this._struct.__BYTE_LENGTH
    new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + index * byteLength, byteLength).fill(0)
  }

  private allocate() {
    this.ptr.value = this._allocator.allocate(this._byteLength)
    this.allocateInternal(this._allocator.heap, this._initialSize)
    this._size.value = this._initialSize
  }

  private allocateInternal(heap: ArrayBuffer, size?: number) {
    const ptr = this.ptr.value
    this._size.allocate(ptr, heap)
    this._length.allocate(ptr, heap)
    const dataViewOffset = this._size.byteLength + this._length.byteLength
    const byteLength = StructCollection.calculateByteLength(size ?? this._initialSize, this._struct.__BYTE_LENGTH)
    this._dataView = new DataView(heap, ptr + dataViewOffset, byteLength - dataViewOffset)
    this._componentDataAccessor = createComponentDataAccessor<TSchema>(this._struct, this._dataView)
  }

  private resize(newSize: number) {
    const oldPtr = this.ptr.value
    const oldDataView = this._dataView
    const oldLength = this._length.value
    this._byteLength = StructCollection.calculateByteLength(newSize, this._struct.__BYTE_LENGTH)
    Logger.log(`[StructCollection] resize:`, this.ptr.value, this._byteLength, this._length.value, this._struct.__KEYS)
    this.ptr.value = this._allocator.allocate(this._byteLength)
    this.allocateInternal(this._allocator.heap, newSize)
    // copy old data view to new data view
    const oldData = new Uint8Array(oldDataView.buffer, oldDataView.byteOffset, oldDataView.byteLength)
    const newData = new Uint8Array(this._dataView.buffer, this._dataView.byteOffset, this._dataView.byteLength)
    newData.set(oldData)
    this._size.value = newSize
    this._length.value = oldLength
    this._allocator.free(oldPtr)
  }
}