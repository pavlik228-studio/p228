import { Allocator } from '../allocator/allocator'
import { List } from '../allocator/collections/list'
import { DataType, DataTypeSize } from '../allocator/data-type'
import { Logger } from '../misc/logger'
import { EntityRef } from '../types'
import { Filter } from './filter'
import { FilterRegistry } from './filter-registry'

export class FilterCollection {
  public readonly count: number
  private readonly _filterEntitiesLists: Array<List>

  public static calculateByteLength(size: number, filterCount: number): number {
    return size * DataTypeSize[DataType.u32] * filterCount
  }

  constructor(
    private readonly _allocator: Allocator,
    private readonly _filterRegistry: FilterRegistry,
    private readonly _initialSize: number,
  ) {
    this.count = this._filterRegistry.count
    this._filterEntitiesLists = new Array(this.count)

    for (const [ filterId, filter ] of this._filterRegistry.filtersById) {
      const list = this._allocator.allocateStruct(List, this._initialSize, DataType.u32)
      this._filterEntitiesLists[filterId] = list

      const includeBitmask = filter.include.reduce((acc, component) => acc | component._ID, 0)
      const excludeBitmask = filter.exclude.reduce((acc, component) => acc | component._ID, 0)
      filter.initialize(list, includeBitmask, excludeBitmask)
    }
  }

  public updateFilters(entityRef: EntityRef, entityComponentsBitmask: number): void {
    Logger.log(`[Filters] Updating filters for entity ${entityRef}`)
    for (const [ filterId, filter ] of this._filterRegistry.filtersById) {
      const entityIdx = this._filterEntitiesLists[filterId].indexOf(entityRef)
      if (entityIdx === -1) {
        this.tryAddFilterEntity(entityRef, entityComponentsBitmask, filterId, filter)
      } else {
        this.tryRemoveFilterEntity(entityIdx, entityComponentsBitmask, filterId, filter)
      }
    }
  }

  private tryRemoveFilterEntity(entityIdx: number, entityBitmask: number, filterId: number, filter: Filter): void {
    if (
      ((entityBitmask | filter.includeBitmask) === entityBitmask)
      && ((entityBitmask & filter.excludeBitmask) === 0)
    ) return

    Logger.log(`[Filters] Removing entity ${entityIdx} from filter ${filterId}`)

    this._filterEntitiesLists[filterId].remove(entityIdx)
  }

  private tryAddFilterEntity(entityRef: EntityRef, entityBitmask: number, filterId: number, filter: Filter): void {
    if ((entityBitmask | filter.includeBitmask) !== entityBitmask) return
    if ((entityBitmask & filter.excludeBitmask) !== 0) return

    Logger.log(`[Filters] Adding entity ${entityRef} to filter ${filterId}`)

    this._filterEntitiesLists[filterId].add(entityRef)
  }
}