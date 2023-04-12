import { EntityManager } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { IVector2Like } from '@p228/math'
import { Weapon } from '../components/weapon'
import { WeaponData, WeaponType } from '../data/weapon-type'

export function spawnWeapon(
  entityManager: EntityManager,
  weaponType: WeaponType,
  ownerPosition: IVector2Like,
  offsetX: number,
  offsetY: number,
): void {
  const weaponEntityRef = entityManager.createEntity()
  entityManager.addManyComponents(weaponEntityRef, [ Weapon, Transform2d, ])

  Weapon.type[weaponEntityRef] = weaponType
  Weapon.attackType[weaponEntityRef] = WeaponData[weaponType].attackType
  Weapon.offsetX[weaponEntityRef] = offsetX
  Weapon.offsetY[weaponEntityRef] = offsetY

  Transform2d.x[weaponEntityRef] = Transform2d.prevX[weaponEntityRef] = ownerPosition.x + offsetX
  Transform2d.y[weaponEntityRef] = Transform2d.prevY[weaponEntityRef] = ownerPosition.y + offsetY
}