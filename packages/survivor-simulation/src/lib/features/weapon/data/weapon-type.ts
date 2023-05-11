export enum WeaponId {
  Sword,
  EthernalGun,
  EthernalBlaster,
  EthernalRpg,

  Weapon1,
  Weapon2,
  Weapon3,
  Weapon4,
  Weapon5,
  Weapon6,
  Weapon7,
  Weapon8,
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
export type WeaponsConfig = { [key in WeaponId]?: WeaponUnion }