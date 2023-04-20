import { Transform2d } from '@p228/engine'
import { Vector2 } from '@p228/math'
import { performDamage } from '../../../attack/misc/perform-damage'
import { EnemyAttackData, EnemyAttackType } from '../enemy-attack-type'
import { AbstractEnemyAttack } from './abstract-enemy-attack'

const ENEMY_POSITION_BUFFER = new Vector2()

export class EnemyAttackMelee extends AbstractEnemyAttack {
  protected _attackType: EnemyAttackType = EnemyAttackType.Melee
  protected _attackValues = EnemyAttackData.get(EnemyAttackType.Melee)!

  protected canAttack(): boolean {
    ENEMY_POSITION_BUFFER.set(Transform2d.x[this._ownerRef], Transform2d.y[this._ownerRef])

    return ENEMY_POSITION_BUFFER.sub(this._playerPosition).lengthSquared() <= this._attackValues.chargeRange
  }

  protected performAttack(): void {
    ENEMY_POSITION_BUFFER.set(Transform2d.x[this._ownerRef], Transform2d.y[this._ownerRef])

    if (ENEMY_POSITION_BUFFER.sub(this._playerPosition).lengthSquared() >= this._attackValues.attackRange) return

    performDamage(this._world, this._playerRef, this._ownerRef, -this._attackValues.baseDamage)
  }

}