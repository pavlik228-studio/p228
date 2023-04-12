export enum WeaponType {
  Sword,
  EthernalGun,
  Shotgun,
}
export enum WeaponAttackType {
  Thrust,
  Projectile,
  SpotProjectile,
}

interface IThrustWeapon {
  width: number
  height: number
  baseDamage: number
}

interface IProjectileWeapon {
  cooldown: number
  baseDamage: number
  speed: number
}

interface ISpotProjectileWeapon extends IProjectileWeapon {
  angle: number
  projectiles: number
}

export type IWeapon<TAttackType extends WeaponAttackType> = {
  range: number,
  cooldown: number,
  attackType: TAttackType,
  duration?: number,
} & (
TAttackType extends WeaponAttackType.Thrust
  ? IThrustWeapon
  : TAttackType extends WeaponAttackType.Projectile
    ? IProjectileWeapon
    : TAttackType extends WeaponAttackType.SpotProjectile
      ? ISpotProjectileWeapon
      : never
)

export const WeaponData = {
  [WeaponType.Sword]: { attackType: WeaponAttackType.Thrust, range: 200, cooldown: 60, width: 40, height: 10, baseDamage: 10, duration: 12 } as IWeapon<WeaponAttackType.Thrust>,
  [WeaponType.EthernalGun]: { attackType: WeaponAttackType.Projectile, range: 500, cooldown: 10, baseDamage: 5, speed: 40 } as IWeapon<WeaponAttackType.Projectile>,
  [WeaponType.Shotgun]: { attackType: WeaponAttackType.SpotProjectile, range: 500, cooldown: 90, baseDamage: 5, speed: 40, angle: 0.5, projectiles: 5 } as IWeapon<WeaponAttackType.SpotProjectile>,
}

