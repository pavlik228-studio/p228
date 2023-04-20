import type { TFunction } from 'i18next'
import {
  WeaponAttackType,
  WeaponData,
  WeaponType,
} from '../../../../../survivor-simulation/src/lib/features/weapon/data/weapon-type'

const excludedWeaponStats = {
  price: void 0,
  duration: void 0,
  width: void 0,
  height: void 0,
  angle: void 0,
  attackType: void 0,
}
const formaters: { [key: string]: (value: any, t: TFunction) => string } = {
  attackType: (value: WeaponAttackType, t) => t(`weaponAttackType.${WeaponAttackType[value]}`),
  critChance: (value: number) => `${Math.round((value * 100 * 10)) / 10}%`,
  critDamage: (value: number) => `${Math.round((value * 100 * 10)) / 10}%`,
}

export function extractWeaponStats(weaponType: WeaponType, level: number, t: TFunction): [ string, string ][] {
  const weaponValues = WeaponData[weaponType]

  return Object.entries(weaponValues)
    .filter(([ key ]) => !excludedWeaponStats.hasOwnProperty(key))
    .map(([ key, value ]) => {
      let statValue = Array.isArray(value)
        ? value[level]
        : value
      if (formaters.hasOwnProperty(key)) statValue = formaters[key](statValue, t)
      return [ `stats.weapon.${key}`, statValue.toString() ]
    })
}