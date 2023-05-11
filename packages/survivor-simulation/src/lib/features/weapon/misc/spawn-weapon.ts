import { EntityManager, EntityRef } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { IVector2Like, MathOps } from '@p228/math'
import { SimulationData } from '../../../simulation-data'
import { Player } from '../../player/components/player'
import { Weapon } from '../components/weapon'
import { WeaponId } from '../data/weapon-type'

const MAX_WEAPON_COUNT = 6
const WEAPON_RADIUS = 90

export function spawnWeapon(
  entityManager: EntityManager,
  ownerEntityRef: EntityRef,
  weaponType: WeaponId,
  level: number,
  ownerPosition: IVector2Like,
): void {
  const weaponCount = Player.weaponCount[ownerEntityRef]
  const weaponEntityRef = entityManager.createEntity()
  const { x: offsetX, y: offsetY } = getWeaponOffset(weaponCount)

  entityManager.addManyComponents(weaponEntityRef, [ Weapon, Transform2d, ])

  Weapon.type[weaponEntityRef] = weaponType
  Weapon.level[weaponEntityRef] = level
  Weapon.attackType[weaponEntityRef] = SimulationData.weapons[weaponType].attackType
  Weapon.offsetX[weaponEntityRef] = offsetX
  Weapon.offsetY[weaponEntityRef] = offsetY

  Transform2d.x[weaponEntityRef] = Transform2d.prevX[weaponEntityRef] = ownerPosition.x + offsetX
  Transform2d.y[weaponEntityRef] = Transform2d.prevY[weaponEntityRef] = ownerPosition.y + offsetY

  Player.weaponCount[ownerEntityRef] = weaponCount + 1
}

function getWeaponOffset(weaponIdx: number): IVector2Like {
  const angle = (weaponIdx / MAX_WEAPON_COUNT) * MathOps.PI_2

  return {
    x: MathOps.cos(angle) * WEAPON_RADIUS,
    y: MathOps.sin(angle) * WEAPON_RADIUS,
  }
}