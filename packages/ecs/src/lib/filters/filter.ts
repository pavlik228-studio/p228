import { List } from '../allocator/collections/list'
import { IComponentInternal } from '../components/component.types'

export class Filter {
  public entities!: List
  private _includeBitmask!: number
  private _excludeBitmask!: number

  public get includeBitmask(): number {
    return this._includeBitmask
  }
  public get excludeBitmask(): number {
    return this._excludeBitmask
  }

  constructor(
    public readonly include: Array<IComponentInternal> = [],
    public readonly exclude: Array<IComponentInternal> = [],
  ) {
  }

  public initialize(list: List, includeBitmask: number, excludeBitmask: number): void {
    if (includeBitmask === 0) throw new Error('Filter must have at least one include or exclude component')
    this.entities = list
    this._includeBitmask = includeBitmask
    this._excludeBitmask = excludeBitmask
  }

  public *[Symbol.iterator](): IterableIterator<number> {
    const length = this.entities.length
    for (let i = 0; i < length; i++) {
      yield this.entities.get(i) as number
    }
  }
}