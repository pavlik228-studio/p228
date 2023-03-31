import { Allocator } from '../allocator/allocator'
import { List } from '../allocator/collections/list'
import { DataType } from '../allocator/data-type'
import { ComponentRegistry } from '../components/component-registry'
import { FilterRegistry } from './filter-registry'

export class FilterCollection {
  public readonly count: number
  private readonly _filterEntitiesLists: Array<List>

  constructor(
    private readonly _allocator: Allocator,
    private readonly _filterRegistry: FilterRegistry,
    private readonly _componentRegistry: ComponentRegistry,
    private readonly _initialSize: number,
  ) {
    this.count = this._filterRegistry.count
    this._filterEntitiesLists = new Array(this.count)
    const componentIds = this._componentRegistry.componentIds

    for (const [ filterId, filter ] of this._filterRegistry.filtersById) {
      const list = this._allocator.allocateStruct(List, this._initialSize, DataType.u32)
      this._filterEntitiesLists[filterId] = list

      const includeBitmask = filter.include.reduce((acc, componentConstructor) => acc | componentIds.get(componentConstructor)!, 0)
      const excludeBitmask = filter.exclude.reduce((acc, componentConstructor) => acc | componentIds.get(componentConstructor)!, 0)
      filter.initialize(list, includeBitmask, excludeBitmask)
    }
  }

  public updateFilters(entityRef: number) {
    // TODO: remove entity from filter if it doesn't match anymore
    const entityBitmask = this._componentRegistry.getEntityComponentsBitmask(entityRef)
    for (const [ filterId, filter ] of this._filterRegistry.filtersById) {
      if ((!entityBitmask || filter.includeBitmask) !== filter.includeBitmask) continue
      if (entityBitmask & filter.excludeBitmask) continue
      this._filterEntitiesLists[filterId].add(entityRef)
    }
  }
}