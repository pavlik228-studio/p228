import { Transform2d } from '@p228/engine'
import { Vector2 } from '@p228/math'
import { CollisionGroups } from '../../../../collision-groups'
import { ProjectileType } from '../../../projectile/components/projectile'
import { spawnProjectile } from '../../../projectile/misc/spawn-projectile'
import { EnemyAttackData, EnemyAttackType } from '../enemy-attack-type'
import { AbstractEnemyAttack } from './abstract-enemy-attack'

const ENEMY_POSITION_BUFFER = new Vector2()
const PLAYER_POSITION_BUFFER = new Vector2()

export class EnemyAttackShoot extends AbstractEnemyAttack {
  protected _attackType: EnemyAttackType = EnemyAttackType.Shoot
  protected _attackValues = EnemyAttackData.get(EnemyAttackType.Shoot)!

  protected canAttack(): boolean {
    ENEMY_POSITION_BUFFER.set(Transform2d.x[this._ownerRef], Transform2d.y[this._ownerRef])

    return ENEMY_POSITION_BUFFER.sub(this._playerPosition).lengthSquared() <= this._attackValues.chargeRange
  }

  protected performAttack(): void {
    ENEMY_POSITION_BUFFER.set(Transform2d.x[this._ownerRef], Transform2d.y[this._ownerRef])
    PLAYER_POSITION_BUFFER.from(this._playerPosition).sub(ENEMY_POSITION_BUFFER).normalize()
    spawnProjectile(
      this._world,
      this._ownerRef,
      ProjectileType.Enemy,
      CollisionGroups.EnemyProjectile,
      ENEMY_POSITION_BUFFER,
      PLAYER_POSITION_BUFFER,
      this._attackValues.projectileSpeed!,
      this._attackValues.baseDamage
    )
  }

}