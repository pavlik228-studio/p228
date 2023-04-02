import { Allocator } from './allocator/allocator'
import { Array as HeapArray } from './allocator/collections/array'
import { List } from './allocator/collections/list'
import { DataType } from './allocator/data-type'
import { Primitive } from './allocator/misc/primitive'
import { IComponentInternal } from './components/component.types'
import { ECSConfig } from './ecs-config'
import { FilterCollection } from './filters/filter-collection'
import { FilterRegistry } from './filters/filter-registry'
import { EntityRef } from './types'

export class EntityManager {
  public readonly byteLength: number

  private readonly _filterCollection: FilterCollection
  private readonly _nextComponentIdx: Primitive
  private readonly _recycledEntities: List
  private readonly _entityComponents: HeapArray // contains entity components

  constructor(
    private readonly _config: ECSConfig,
    private readonly _allocator: Allocator,
    private readonly _filterRegistry: FilterRegistry,
  ) {
    this._filterCollection = new FilterCollection(_allocator, _filterRegistry, _config.filterPoolSize)
    this._nextComponentIdx = _allocator.allocateStruct(Primitive, DataType.u32)
    this.byteLength = this._nextComponentIdx.byteLength
    this._recycledEntities = _allocator.allocateStruct(List, _config.recycledPoolSize, DataType.u32)
    this.byteLength += this._recycledEntities.byteLength
    this._entityComponents = new HeapArray(_allocator, _config.entityPoolSize, DataType.i32)
    this.byteLength += this._entityComponents.byteLength
  }

  public static calculateByteLength(config: ECSConfig, ): number {
    return Primitive.byteLength
      + List.calculateByteLength(config.recycledPoolSize, DataType.u32)
      + HeapArray.calculateByteLength(config.entityPoolSize, DataType.i32)
  }

  public createEntity(): EntityRef {
    const entityRef = this._recycledEntities.pop() ?? this._nextComponentIdx.value++

    this._entityComponents.set(entityRef, 0)

    return entityRef
  }

  public createEntityPrefab(entityRef: EntityRef, components: IComponentInternal[]): void {
    let entityComponentsBitmask = 0
    for (const component of components) {
      entityComponentsBitmask |= component._ID
    }
    this._entityComponents.set(entityRef, entityComponentsBitmask)
    this._filterCollection.updateFilters(entityRef, entityComponentsBitmask)
  }

  public destroyEntity(entityRef: EntityRef): void {
    this._entityComponents.set(entityRef, -1)
    this._filterCollection.updateFilters(entityRef, 0)
  }

  public hasEntity(entityRef: EntityRef): boolean {
    return this._entityComponents.get(entityRef) !== -1
  }

  public hasComponent(entityRef: EntityRef, component: IComponentInternal): boolean {
    return (Math.max(this._entityComponents.get(entityRef), 0) & component._ID) !== 0
  }

  public addComponent(entityRef: EntityRef, component: IComponentInternal): void {
    let entityComponentsBitmask = this._entityComponents.get(entityRef)
    if (entityComponentsBitmask === -1) throw new Error('Entity is destroyed')
    entityComponentsBitmask |= component._ID
    this._entityComponents.set(entityRef, entityComponentsBitmask)
    this._filterCollection.updateFilters(entityRef, entityComponentsBitmask)
  }

  public addManyComponents(entityRef: EntityRef, components: IComponentInternal[]): void {
    let entityComponentsBitmask = this._entityComponents.get(entityRef)
    if (entityComponentsBitmask === -1) throw new Error('Entity is destroyed')
    for (const component of components) {
      entityComponentsBitmask |= component._ID
    }
    this._entityComponents.set(entityRef, entityComponentsBitmask)
    this._filterCollection.updateFilters(entityRef, entityComponentsBitmask)
  }

  public removeComponent(entityRef: EntityRef, component: IComponentInternal): void {
    let entityComponentsBitmask = this._entityComponents.get(entityRef)
    if (entityComponentsBitmask === -1) throw new Error('Entity is destroyed')
    entityComponentsBitmask &= ~component._ID
    this._entityComponents.set(entityRef, entityComponentsBitmask)
    this._filterCollection.updateFilters(entityRef, entityComponentsBitmask)
  }

  public removeManyComponents(entityRef: EntityRef, components: IComponentInternal[]): void {
    let entityComponentsBitmask = this._entityComponents.get(entityRef)
    if (entityComponentsBitmask === -1) throw new Error('Entity is destroyed')
    for (const component of components) {
      entityComponentsBitmask &= ~component._ID
    }
    this._entityComponents.set(entityRef, entityComponentsBitmask)
    this._filterCollection.updateFilters(entityRef, entityComponentsBitmask)
  }
}