import { EntityRef } from '@p228/ecs'
import { Player } from '../../player/components/player'
import { Weapon } from '../components/weapon'
import { WeaponData, WeaponType } from './weapon-type'

const PLAYER_DAMAGE_BUFFER = {
  damage: 0,
  hasCrit: false,
}
export function calculatePlayerDamage(
  weaponEntityRef: EntityRef,
  random: number
) {
  const playerEntityRef = Weapon.ownerRef[weaponEntityRef]
  const weaponLvl = Weapon.level[weaponEntityRef]
  const weaponValues = WeaponData[Weapon.type[weaponEntityRef] as WeaponType]
  const critChance = Player.critChance[playerEntityRef] + weaponValues.critChance[weaponLvl]
  const critDamage = Player.critDamage[playerEntityRef] + weaponValues.critDamage[weaponLvl]

  PLAYER_DAMAGE_BUFFER.hasCrit = random < critChance
  PLAYER_DAMAGE_BUFFER.damage = (weaponValues.baseDamage[weaponLvl] + Player.damage[playerEntityRef]) * (PLAYER_DAMAGE_BUFFER.hasCrit ? critDamage : 1)

  return PLAYER_DAMAGE_BUFFER
}