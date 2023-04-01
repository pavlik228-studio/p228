import { Allocator } from '../allocator/allocator'
import { List } from '../allocator/collections/list'
import { Array } from '../allocator/collections/array'
import { DataType } from '../allocator/data-type'
import { Primitive } from '../allocator/misc/primitive'
import { ComponentRegistry } from '../components/component-registry'
import {
  IComponentConstructor,
  IComponentData,
  IComponentSchema,
} from '../components/component.types'
import { EcsConfig } from '../configs/ecs-config'
import { FilterCollection } from '../filters/filter-collection'
import { FilterRegistry } from '../filters/filter-registry'
import { EntityRef } from '../types'

export class EntityManager {
  private readonly _nextEntityId: Primitive
  private readonly _recycledEntityIds: List
  private readonly _hasEntityArray: Array
  private readonly _filterCollection: FilterCollection
  constructor(
    private readonly _ecsConfig: EcsConfig,
    private readonly _allocator: Allocator,
    private readonly _componentRegistry: ComponentRegistry,
    private readonly _filterRegistry: FilterRegistry,
  ) {
    this._nextEntityId = this._allocator.allocateStruct(Primitive, DataType.u32)
    this._recycledEntityIds = this._allocator.allocateStruct(List, _ecsConfig.entityPoolSize, DataType.u32)
    this._hasEntityArray = this._allocator.allocateStruct(Array, _ecsConfig.entityPoolSize, DataType.u32)
    this._componentRegistry.createCollections(this._allocator, _ecsConfig.entityPoolSize, _ecsConfig.componentPoolSize)
    this._filterCollection = new FilterCollection(this._allocator, this._filterRegistry, this._componentRegistry, _ecsConfig.filtersPoolSize)
  }

  public createEntity(): EntityRef {
    const entityRef = this._recycledEntityIds.shift() ?? this._nextEntityId.value++
    this._hasEntityArray.set(entityRef, 1)

    return entityRef
  }

  public destroyEntity(entityRef: EntityRef) {
    this._componentRegistry.destroyEntity(entityRef)
    this._recycledEntityIds.add(entityRef)
    this._hasEntityArray.set(entityRef, 0)
  }

  public hasEntity(entityRef: EntityRef): boolean {
    return this._hasEntityArray.get(entityRef) === 1
  }

  public putComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor<TSchema>
  >(entityRef: EntityRef, component: TComponentConstructor) {
    const result = this._componentRegistry.addComponent<TSchema, TComponentConstructor>(entityRef, component)

    this._filterCollection.updateFilters(entityRef)

    return result
  }

  public putManyComponents<
    T extends readonly unknown[]
  >(entityRef: EntityRef, components: T) {
    const returnValues: T extends IComponentConstructor[] ? { -readonly [P in keyof T]: IComponentData<ReturnType<InstanceType<T[P]>['registerSchema']>> } : { -readonly [P in keyof T]: T[P] } = [] as any
    for (let i = 0; i < components.length; i++) {
      returnValues[i] = this._componentRegistry.addComponent(entityRef, components[i] as any) as any
    }

    this._filterCollection.updateFilters(entityRef)

    return returnValues
  }

  public addComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor<TSchema>,
  >(entityRef: number, component: TComponentConstructor, values: IComponentData<TSchema>) {
    const accessor = this._componentRegistry.addComponent<TSchema, TComponentConstructor>(entityRef, component)
    this._filterCollection.updateFilters(entityRef)

    for (const key in values) accessor[key] = values[key] as never

    return accessor
  }

  public getComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor
  >(entityRef: EntityRef, component: TComponentConstructor) {
    return this._componentRegistry.getComponent<TSchema, TComponentConstructor>(entityRef, component)
  }

  public hasComponent(entityRef: EntityRef, component: IComponentConstructor) {
    return this._componentRegistry.hasComponent(entityRef, component)
  }

  public removeComponent(entityRef: EntityRef, component: IComponentConstructor) {
    this._componentRegistry.removeComponent(entityRef, component)
    this._filterCollection.updateFilters(entityRef)
  }
}