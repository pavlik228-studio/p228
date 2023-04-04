import { IComponentInternal } from '../components/component.types'
import { Filter } from './filter'

export class FilterRegistry {
  public readonly filtersById = new Map<number, Filter>()
  public readonly filterBitmaskIds = new Map<number, number>()
  private _nextFilterId = 0

  public get count(): number {
    return this.filtersById.size
  }

  public registerFilter(filter: Filter): Filter {
    const includeBitmask = this.getComponentBitmask(filter.include) << 16
    const excludeBitmask = this.getComponentBitmask(filter.exclude)
    const filterBitmask = includeBitmask | excludeBitmask

    let filterId: number

    if (!this.filterBitmaskIds.has(filterBitmask)) {
      filterId = this._nextFilterId++
      this.filterBitmaskIds.set(filterBitmask, filterId)
    } else {
      filterId = this.filterBitmaskIds.get(filterBitmask)!
      filter = this.filtersById.get(filterId)!
    }

    this.filterBitmaskIds.set(filterBitmask, filterId)
    this.filtersById.set(filterId, filter)

    return filter
  }

  private getComponentBitmask(components: Array<IComponentInternal>): number {
    return components.reduce((acc, component) => acc | component._ID, 0)
  }
}