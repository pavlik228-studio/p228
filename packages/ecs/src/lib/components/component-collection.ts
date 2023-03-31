import { Allocator } from '../allocator/allocator'
import { List } from '../allocator/collections/list'
import { StructCollection } from '../allocator/collections/struct-collection'
import { DataType } from '../allocator/data-type'
import { ComponentSchema } from './component-schema'
import { IComponentDataAccessor, IComponentSchema } from './component.types'
import { Array } from '../allocator/collections/array'

export class ComponentCollection<TSchema extends IComponentSchema = IComponentSchema> {
  private readonly _structCollection: StructCollection<TSchema>
  private readonly _dataPtrArray: Array
  private readonly _recycledDataIdx: List

  constructor(
    private readonly _allocator: Allocator,
    private readonly _componentSchema: ComponentSchema<TSchema>,
    private readonly _maxSize: number,
    private readonly _initialSize: number,
  ) {
    this._dataPtrArray = this._allocator.allocateStruct(Array, _maxSize, DataType.i32, -1)
    this._structCollection = this._allocator.allocateStruct(StructCollection, _initialSize, _componentSchema as never) as StructCollection<TSchema>
    this._recycledDataIdx = this._allocator.allocateStruct(List, _initialSize, DataType.u32)
  }

  public static calculateByteLength(size: number, schemaByteLength: DataType) {
    return schemaByteLength * size
  }

  public get(entityRef: number): IComponentDataAccessor<TSchema> {
    const componentDataPtr = this._dataPtrArray.get(entityRef)

    if (componentDataPtr === -1) throw new Error(`Component data not found for entityRef ${entityRef}`)

    return this._structCollection.get(componentDataPtr)
  }

  public has(entityRef: number): boolean {
    return this._dataPtrArray.get(entityRef) !== -1
  }

  public add(entityRef: number, reset = false): IComponentDataAccessor<TSchema> {
    const index = this._recycledDataIdx.shift() ?? this._structCollection.add()
    this._dataPtrArray.set(entityRef, index)

    if (reset) this._structCollection.resetForIndex(index)

    return this._structCollection.get(index)
  }

  public remove(entityRef: number) {
    const componentDataPtr = this._dataPtrArray.get(entityRef)
    this._dataPtrArray.set(entityRef, -1)
    this._recycledDataIdx.add(componentDataPtr)
  }
}