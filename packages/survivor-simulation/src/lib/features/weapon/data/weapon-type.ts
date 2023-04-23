import { MathOps } from '@p228/math'

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

export const WeaponData = {
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
    cooldown: [ 0.1, 1.01, 1.01, 1.01, ],
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
    baseDamage: [ 0, 50, 80, 30 ],
    critChance: [ 0.03, 0.03, 0.03, 0.03, ],
    critDamage: [ 2, 2, 2, 2 ],
    attackType: WeaponAttackType.RocketProjectile,
    range: 700,
    speed: 40,
    duration: 50,
    explosionRadius: 300,
  } as IWeapon<WeaponAttackType.RocketProjectile>,
}

