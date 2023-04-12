import { Transform2d } from '@p228/engine'
import { IVector2Like, MathOps, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { CollisionGroups } from '../../../../collision-groups'
import { findClosestEnemyInRadiusOptimal } from '../../../attack/misc/find-enemy-in-radius'
import { ProjectileType } from '../../../projectile/components/projectile'
import { spawnProjectile } from '../../../projectile/misc/spawn-projectile'
import { Weapon } from '../../components/weapon'
import { WeaponAttackType } from '../weapon-type'
import { AbstractWeaponAttack } from './abstract-weapon-attack'

export class WeaponAttackProjectile extends AbstractWeaponAttack<WeaponAttackType.Projectile> {
  public readonly attackType = WeaponAttackType.Projectile
  protected attack(progress: number, target: IVector2Like | undefined): void {
    if (target === undefined) throw new Error('Target is undefined')

    VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    VECTOR2_BUFFER_2.from(target).sub(VECTOR2_BUFFER_1).normalize()

    Transform2d.rotation[this._weaponEntityRef] = MathOps.atan2(VECTOR2_BUFFER_2.y, VECTOR2_BUFFER_2.x)

    spawnProjectile(
      this._world,
      Weapon.ownerRef[this._weaponEntityRef],
      ProjectileType.Ethernal,
      CollisionGroups.PlayerProjectile,
      VECTOR2_BUFFER_1,
      VECTOR2_BUFFER_2,
      this._weaponValues.speed,
      this._weaponValues.baseDamage,
    )
  }

  protected findTarget() {
    VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    const optimalTarget = findClosestEnemyInRadiusOptimal(
      this._world,
      this._weaponEntityRef,
      VECTOR2_BUFFER_1,
      this._weaponValues.range,
      this._attackedTargets
    )

    if (optimalTarget === undefined) return

    this._attackedTargets.push(optimalTarget)

    return this._world.physicsWorld.colliders.get(optimalTarget)!.translation()
  }

}