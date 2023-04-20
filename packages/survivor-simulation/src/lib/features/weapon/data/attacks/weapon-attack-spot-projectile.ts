import { Transform2d } from '@p228/engine'
import {
  IVector2Like,
  MathOps, Vector2,
  VECTOR2_BUFFER_1,
  VECTOR2_BUFFER_3,
  VECTOR2_BUFFER_4,
} from '@p228/math'
import { CollisionGroups } from '../../../../collision-groups'
import { findClosestEnemyInRadiusOptimal } from '../../../attack/misc/find-enemy-in-radius'
import { ProjectileType } from '../../../projectile/components/projectile'
import { spawnProjectile } from '../../../projectile/misc/spawn-projectile'
import { Weapon } from '../../components/weapon'
import { calculatePlayerDamage } from '../calculate-player-damage'
import { WeaponAttackType } from '../weapon-type'
import { AbstractWeaponAttack } from './abstract-weapon-attack'

const SHOOT_POINT_BUFFER = new Vector2()
const DIRECTION_BUFFER = new Vector2()

export class WeaponAttackSpotProjectile extends AbstractWeaponAttack<WeaponAttackType.SpotProjectile> {
  public readonly attackType = WeaponAttackType.SpotProjectile

  protected attack(progress: number, target: IVector2Like | undefined): void {
    if (target === undefined) throw new Error('Target is undefined')

    const shootPoint = SHOOT_POINT_BUFFER.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    const direction = DIRECTION_BUFFER.from(target).sub(shootPoint).normalize()

    Transform2d.rotation[this._weaponEntityRef] = MathOps.atan2(direction.y, direction.x)

    // calculate projectiles directions
    const angle = this._weaponValues.angle

    let projectilesToSpawn = this._weaponValues.projectiles
    let startAngle = angle / 2
    let angleStep = angle / (projectilesToSpawn - 1)

    const isEven = this._weaponValues.projectiles % 2 == 0
    if (!isEven) {
      this.spawnProjectile(shootPoint, direction)
      projectilesToSpawn -= 1
    }

    const dir1 = VECTOR2_BUFFER_3.set(0, 0)
    const dir2 = VECTOR2_BUFFER_4.set(0, 0)

    for (let i = 0; i < projectilesToSpawn / 2; i++) {
      dir1.from(direction).rotate(startAngle)
      dir2.from(direction).rotate(startAngle * -1)
      this.spawnProjectile(shootPoint, dir1)
      this.spawnProjectile(shootPoint, dir2)

      startAngle -= angleStep
    }
  }

  protected findTarget() {
    VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    const optimalTarget = findClosestEnemyInRadiusOptimal(
      this._world,
      this._weaponEntityRef,
      VECTOR2_BUFFER_1,
      this._weaponValues.range,
      this._attackedTargets,
    )

    if (optimalTarget === undefined) return

    this._attackedTargets.push(optimalTarget)

    return this._world.physicsWorld.colliders.get(optimalTarget)!.translation()
  }

  private spawnProjectile(shootPoint: IVector2Like, direction: IVector2Like) {
    const { damage, hasCrit } = calculatePlayerDamage(this._weaponEntityRef, this._world.random.nextFloat())
    spawnProjectile(
      this._world,
      Weapon.ownerRef[this._weaponEntityRef],
      ProjectileType.EthernalShot,
      CollisionGroups.PlayerProjectile,
      shootPoint,
      direction,
      this._weaponValues.speed,
      damage,
      hasCrit
    )
  }

}