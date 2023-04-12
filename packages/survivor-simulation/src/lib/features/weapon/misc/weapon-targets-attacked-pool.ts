import { EntityRef, List } from '@p228/ecs'
import { SurvivorWorld } from '@p228/survivor-simulation'

const INITIAL_LIST_COUNT = 8
const INITIAL_LIST_CAPACITY = 8

export class WeaponTargetsAttackedPool {
  private readonly freeLists = new Array<List>()
  private readonly allocatedLists = new Map<EntityRef, List>()

  constructor(
    private readonly _world: SurvivorWorld
  ) {
    for (let i = 0; i < INITIAL_LIST_COUNT; i++) {
      this.freeLists.push(this._world.allocator.allocateStruct(List, INITIAL_LIST_CAPACITY))
    }
  }

  public get(weaponId: EntityRef): List {
    return this.allocatedLists.get(weaponId) ?? this.allocate(weaponId)
  }

  private allocate(weaponId: EntityRef): List {
    let list = this.freeLists.pop()
    if (list === undefined) {
      list = this._world.allocator.allocateStruct(List, INITIAL_LIST_CAPACITY)
    }
    this.allocatedLists.set(weaponId, list)
    return list
  }

  public release(weaponId: EntityRef): void {
    const list = this.allocatedLists.get(weaponId)
    if (list === undefined) return
    list.clear()
    this.freeLists.push(list)
    this.allocatedLists.delete(weaponId)
  }
}