import { List } from '../allocator/collections/list'
import { IComponentConstructor } from '../components/component.types'
import { EntityRef } from '../types'

export class Filter {
  private _list!: List
  private _includeBitmask!: number
  private _excludeBitmask!: number

  public get includeBitmask(): number {
    return this._includeBitmask
  }
  public get excludeBitmask(): number {
    return this._excludeBitmask
  }

  constructor(
    public readonly include: Array<IComponentConstructor> = [],
    public readonly exclude: Array<IComponentConstructor> = [],
  ) {
  }

  public initialize(list: List, includeBitmask: number, excludeBitmask: number): void {
    if (includeBitmask === 0) throw new Error('Filter must have at least one include or exclude component')
    this._list = list
    this._includeBitmask = includeBitmask
    this._excludeBitmask = excludeBitmask
  }

  public *[Symbol.iterator](): Iterator<EntityRef> {
    for (let i = 0; i < this._list.length; i++) {
      yield this._list.get(i) as number
    }
  }
}