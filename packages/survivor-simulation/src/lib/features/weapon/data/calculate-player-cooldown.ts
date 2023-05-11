import { EntityRef } from '@p228/ecs'
import { SimulationData } from '../../../simulation-data'
import { Player } from '../../player/components/player'
import { Weapon } from '../components/weapon'
import { WeaponId } from './weapon-type'

const MIN_COOLDOWN = 0.1

export function calculatePlayerCooldown(
  weaponEntityRef: EntityRef,
  deltaTime: number
): number {
  const playerEntityRef = Weapon.ownerRef[weaponEntityRef]
  const weaponValues = SimulationData.weapons[Weapon.type[weaponEntityRef] as WeaponId]
  const cooldown = weaponValues.cooldown[Weapon.level[weaponEntityRef]] * Math.max((1 - Player.attackSpeed[playerEntityRef]), MIN_COOLDOWN)

  return Math.round(cooldown * 1000 / deltaTime)
}