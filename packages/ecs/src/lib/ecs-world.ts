import { EcsConfig } from './configs/ecs-config'
import { Allocator } from './allocator/allocator'
import { EntityManager } from './entity-manager/entity-manager'
import { ComponentRegistry } from './components/component-registry'
import {
  IComponentConstructor,
  IComponentData,
  IComponentSchema,
} from './components/component.types'
import { Filter } from './filters/filter'
import { FilterRegistry } from './filters/filter-registry'
import { AbstractSystem, IAbstractSystemConstructor } from './systems/abstract-system'
import { SystemRegistry } from './systems/system-registry'
import { EntityRef } from './types'

export abstract class ECSWorld {
  private readonly _componentRegistry: ComponentRegistry
  private readonly _entityManager: EntityManager
  private readonly _allocator: Allocator
  private readonly _filterRegistry: FilterRegistry
  private readonly _systemRegistry: SystemRegistry
  public abstract registerComponents(): Array<IComponentConstructor>
  public abstract registerSystems(): Array<IAbstractSystemConstructor>

  public get entityManager(): EntityManager {
    return this._entityManager
  }

  constructor(
    public readonly ecsConfig: EcsConfig,
  ) {
    this._componentRegistry = new ComponentRegistry(this.registerComponents())
    this._filterRegistry = new FilterRegistry(this._componentRegistry)
    const allocatorByteLength = Math.ceil(ecsConfig.calculateInitialAllocatorByteLength(this._componentRegistry.byteLength) / 8) * 8
    const registrySize = ecsConfig.registrySize + this._componentRegistry.count * this._componentRegistry.ptrPerComponent
    this._allocator = new Allocator(allocatorByteLength, ecsConfig.memoryBlocks, registrySize)
    this._systemRegistry = new SystemRegistry(this)
    this._entityManager = new EntityManager(ecsConfig, this._allocator, this._componentRegistry, this._filterRegistry)
  }

  public getSystem<T extends AbstractSystem>(system: IAbstractSystemConstructor<T>): T {
    return this._systemRegistry.getSystem(system)
  }

  public registerFilter(filter: Filter): Filter {
    return this._filterRegistry.registerFilter(filter)
  }

  public createEntity(): EntityRef {
    return this._entityManager.createEntity()
  }

  public destroyEntity(entityRef: EntityRef) {
    this._entityManager.destroyEntity(entityRef)
  }

  public putComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor<TSchema>
  >(entityRef: EntityRef, component: TComponentConstructor) {
    return this._entityManager.putComponent<TSchema, TComponentConstructor>(entityRef, component)
  }

  public addComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor<TSchema>,
  >(entityRef: number, component: TComponentConstructor, values: IComponentData<TSchema>) {
    return this._entityManager.addComponent<TSchema, TComponentConstructor>(entityRef, component, values)
  }

  public getComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor,
  >(entityRef: EntityRef, component: TComponentConstructor) {
    return this._entityManager.getComponent<TSchema, TComponentConstructor>(entityRef, component)
  }

  public hasComponent(entityRef: EntityRef, component: IComponentConstructor) {
    return this._entityManager.hasComponent(entityRef, component)
  }

  public removeComponent(entityRef: EntityRef, component: IComponentConstructor) {
    this._entityManager.removeComponent(entityRef, component)
  }
}