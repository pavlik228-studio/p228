import { Allocator } from './allocator/allocator'
import { List } from './allocator/collections/list'
import { DataType } from './allocator/data-type'
import { ComponentRegistry } from './components/component-registry'
import { IComponentInternal, ISingletonComponentInternal } from './components/component.types'
import { ECSConfig } from './ecs-config'
import { EntityManager } from './entity-manager'
import { Filter } from './filters/filter'
import { FilterRegistry } from './filters/filter-registry'
import { ISystemConstructor } from './systems/abstract-system'
import { SystemRegistry } from './systems/system-registry'

export abstract class ECSWorld {
  private _updatePipeline!: () => void
  protected readonly _allocator: Allocator
  private readonly _componentRegistry: ComponentRegistry
  private readonly _filterRegistry: FilterRegistry
  private readonly _systemRegistry: SystemRegistry
  private readonly _entityManager: EntityManager

  constructor(public readonly config: ECSConfig) {
    this._componentRegistry = new ComponentRegistry(config, this.registerComponents(), this.registerSingletonComponents())
    this._filterRegistry = new FilterRegistry()
    this._systemRegistry = new SystemRegistry(this, this.registerSystems())
    const byteLength = this.calculateAllocatorByteLength() + config.allocatorBuffer
    this._allocator = new Allocator(byteLength, config.memoryBlocks, config.registrySize)
    this._componentRegistry.initialize(this._allocator)
    this.onBeforeInitialize()
    this._entityManager = new EntityManager(config, this._allocator, this._filterRegistry)
  }

  public get entityManager(): EntityManager {
    return this._entityManager
  }

  public abstract registerComponents(): Array<IComponentInternal>

  public abstract registerSingletonComponents(): Array<ISingletonComponentInternal>

  public abstract registerSystems(): Array<ISystemConstructor<any>>

  public registerFilter(filter: Filter): Filter {
    return this._filterRegistry.registerFilter(filter)
  }

  public getSystem<T extends ISystemConstructor<any>>(system: T): InstanceType<T> {
    return this._systemRegistry._registry.get(system) as InstanceType<T>
  }

  protected onBeforeInitialize(): void {

  }

  protected initializeInternal(): void {
    this._updatePipeline = this._systemRegistry.initializePipeline()
    this.onInitialize()
  }

  protected onInitialize(): void {
  }

  protected updateSystems(): void {
    this._updatePipeline()
  }

  private calculateAllocatorByteLength(): number {
    const filtersByteLength = this._filterRegistry.count * (List.calculateByteLength(this.config.filterPoolSize, DataType.u32))
    const componentsByteLength = this._componentRegistry.byteLength
    const entityManagerByteLength = EntityManager.calculateByteLength(this.config)

    return filtersByteLength + componentsByteLength + entityManagerByteLength
  }
}