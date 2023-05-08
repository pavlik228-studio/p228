import { MathOps } from '@p228/math'
import { SheetsAPI } from '../../../sheets-api'

export enum WeaponType {
  Sword,
  EthernalGun,
  EthernalBlaster,
  EthernalRpg,
}

export enum WeaponAttackType {
  Thrust,
  Projectile,
  SpotProjectile,
  RocketProjectile,
}

interface IBaseWeapon {
  price: Array<number>
  cooldown: Array<number>
  baseDamage: Array<number>
  critChance: Array<number>
  critDamage: Array<number>
}

interface IThrustWeapon extends IBaseWeapon {
  width: number
  height: number
}

interface IProjectileWeapon extends IBaseWeapon {
  speed: number
}

interface ISpotProjectileWeapon extends IProjectileWeapon {
  angle: number
  projectiles: number
}

interface IRocketProjectileWeapon extends IProjectileWeapon {
  explosionRadius: number
}

export type IWeapon<TAttackType extends WeaponAttackType> = {
  range: number,
  attackType: TAttackType,
  duration?: number,
} & (
  TAttackType extends WeaponAttackType.Thrust
    ? IThrustWeapon
    : TAttackType extends WeaponAttackType.Projectile
      ? IProjectileWeapon
      : TAttackType extends WeaponAttackType.SpotProjectile
        ? ISpotProjectileWeapon
        : TAttackType extends WeaponAttackType.RocketProjectile
          ? IRocketProjectileWeapon
          : never
  )
export type WeaponUnion = IWeapon<WeaponAttackType.Thrust> | IWeapon<WeaponAttackType.Projectile> | IWeapon<WeaponAttackType.SpotProjectile> | IWeapon<WeaponAttackType.RocketProjectile>

export let WeaponData: { [key in WeaponType]: WeaponUnion } = {
  [WeaponType.Sword]: {
    price: [ 100, 200, 300, 400 ],
    cooldown: [ 1.37, 1.28, 1.13, 0.98, ],
    baseDamage: [ 15, 25, 40, 60 ],
    critChance: [ 0.03, 0.03, 0.03, 0.03, ],
    critDamage: [ 2, 2, 2, 2, ],
    attackType: WeaponAttackType.Thrust,
    range: 260,
    width: 40,
    height: 10,
    duration: 12,
  } as IWeapon<WeaponAttackType.Thrust>,

  [WeaponType.EthernalGun]: {
    price: [ 200, 400, 800, 1200 ],
    cooldown: [ 1.2, 1.12, 0.93, 0.87, ],
    baseDamage: [ 12, 16, 21, 35 ],
    critChance: [ 0.03, 0.03, 0.03, 0.03, ],
    critDamage: [ 2, 2, 2, 2 ],
    attackType: WeaponAttackType.Projectile,
    range: 500,
    speed: 40,
  } as IWeapon<WeaponAttackType.Projectile>,

  [WeaponType.EthernalBlaster]: {
    price: [ 100, 200, 300, 400 ],
    cooldown: [ 1.37, 1.28, 1.20, 1.12, ],
    baseDamage: [ 12, 24, 36, 72 ],
    critChance: [ 0.03, 0.03, 0.03, 0.03, ],
    critDamage: [ 2, 2, 2, 2 ],
    attackType: WeaponAttackType.SpotProjectile,
    range: 500,
    speed: 40,
    angle: MathOps.Deg2Rad * 20,
    projectiles: 7,
  } as IWeapon<WeaponAttackType.SpotProjectile>,

  [WeaponType.EthernalRpg]: {
    price: [ 0, 200, 300, 400 ],
    cooldown: [ 0, 1.78, 1.37, 1.03 ],
    baseDamage: [ 0, 50, 80, 100 ],
    critChance: [ 0.03, 0.03, 0.03, 0.03, ],
    critDamage: [ 2, 2, 2, 2 ],
    attackType: WeaponAttackType.RocketProjectile,
    range: 700,
    duration: 50,
    explosionRadius: 300,
  } as IWeapon<WeaponAttackType.RocketProjectile>,
}

interface WeaponConfigItem {
  Id: string
  DamageType: keyof WeaponAttackType
  Level: 1 | 2 | 3 | 4
  Price: number
  Damage: number
  CriticalMult: number
  CriticalChance: number
  Cooldown: number
  Range: number
  ProjectileSpeed: number
  SpotAngle: number
  SpotProjectiles: number
  ExplosionRadius: number
  DurationTicks: number
  Width: number
  Height: number
}

export const loadWeaponsConfig = async () => {
  const weaponsSheetApi = new SheetsAPI('1Z8de_G0DAc4LUCKznoLPA_JTyWRk-gzA9rt7WjibFwI', 'WEAPONS')
  const weaponsRaw = await weaponsSheetApi.load<WeaponConfigItem>()

  WeaponData = {} as any
  // merge weapons
  for (const weapon of weaponsRaw) {
    if (!WeaponType.hasOwnProperty(weapon.Id)) throw new Error(`Unknown weapon type: ${weapon.Id}`)
    if (!WeaponAttackType.hasOwnProperty(weapon.DamageType)) throw new Error(`Unknown weapon attack type: ${weapon.DamageType}`)
    if (weapon.Level < 1 || weapon.Level > 4) throw new Error(`Unknown weapon level: ${weapon.Level}`)

    const weaponType = WeaponType[weapon.Id as keyof typeof WeaponType]
    const weaponAttackType = WeaponAttackType[weapon.DamageType as keyof typeof WeaponAttackType]
    const weaponLevel = weapon.Level as unknown as 1 | 2 | 3 | 4
    const levelIndex = weaponLevel - 1

    if (!WeaponData[weaponType]) {
      WeaponData[weaponType] = {
        price: [ 0, 0, 0, 0 ],
        cooldown: [ 0, 0, 0, 0 ],
        baseDamage: [ 0, 0, 0, 0 ],
        critChance: [ 0, 0, 0, 0 ],
        critDamage: [ 0, 0, 0, 0 ],
        attackType: weaponAttackType,
        range: weapon.Range,
        angle: weapon.SpotAngle * MathOps.Deg2Rad,
        projectiles: weapon.SpotProjectiles,
        speed: weapon.ProjectileSpeed,
        explosionRadius: weapon.ExplosionRadius,
        duration: weapon.DurationTicks,
        width: weapon.Width,
        height: weapon.Height,
      }
    }

    WeaponData[weaponType].price[levelIndex] = weapon.Price || 0
    WeaponData[weaponType].cooldown[levelIndex] = weapon.Cooldown || 0
    WeaponData[weaponType].baseDamage[levelIndex] = weapon.Damage || 0
    WeaponData[weaponType].critChance[levelIndex] = weapon.CriticalChance || 0
    WeaponData[weaponType].critDamage[levelIndex] = weapon.CriticalMult || 0
  }

  console.log(JSON.stringify(WeaponData, null, 2))
}

console.log(JSON.stringify(WeaponData, null, 2))
