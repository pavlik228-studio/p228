import { AbstractSystem, EntityRef, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Weapon } from '../components/weapon'

export class WeaponSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _weaponFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)
    this._weaponFilter = world.registerFilter(new Filter([ Weapon, Transform2d, ]))
  }

  public override update(): void {
    for (const weaponEntityRef of this._weaponFilter) {
      if (Weapon.startedAt[weaponEntityRef] !== 0) continue

      WeaponSystem.moveWeapon(weaponEntityRef)
    }
  }

  public static moveWeapon(weaponEntityRef: EntityRef) {
    const ownerRef = Weapon.ownerRef[weaponEntityRef]
    Transform2d.x[weaponEntityRef] = Transform2d.x[ownerRef] + Weapon.offsetX[weaponEntityRef]
    Transform2d.y[weaponEntityRef] = Transform2d.y[ownerRef] + Weapon.offsetY[weaponEntityRef]
  }
}