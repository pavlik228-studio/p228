import { Transform2d } from '@p228/engine'
import { Vector2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { KnockBack } from '../../../attack/components/effects/knock-back'
import { EnemyActiveAttack } from '../../components/enemy-active-attack'
import { EnemyAttackData, EnemyAttackType } from '../enemy-attack-type'
import { AbstractEnemyAttack } from './abstract-enemy-attack'

const ENEMY_POSITION_BUFFER = new Vector2()
const PLAYER_POSITION_BUFFER = new Vector2()

const RAM_SPEED = 1

export class EnemyAttackRam extends AbstractEnemyAttack {
  protected _attackType: EnemyAttackType = EnemyAttackType.Ram
  protected _attackValues = EnemyAttackData.get(EnemyAttackType.Ram)!
  private _deltaTime = this._world.config.deltaTime

  protected canAttack(): boolean {
    PLAYER_POSITION_BUFFER.from(this._playerPosition)
    ENEMY_POSITION_BUFFER.set(Transform2d.x[this._ownerRef], Transform2d.y[this._ownerRef])

    const inRange = PLAYER_POSITION_BUFFER.sub(ENEMY_POSITION_BUFFER).lengthSquared() <= this._attackValues.chargeRange
    if (inRange) {
      PLAYER_POSITION_BUFFER.normalize()
      EnemyActiveAttack.targetX[this._ownerRef] = PLAYER_POSITION_BUFFER.x
      EnemyActiveAttack.targetY[this._ownerRef] = PLAYER_POSITION_BUFFER.y
    }

    return inRange
  }

  protected override chargeAttack() {
    super.chargeAttack()

    for (const playerColliderHandle of this._playerColliderHandles) {
      if (this.checkCollidingWithPlayer(playerColliderHandle, PhysicsRefs.colliderRef[this._ownerRef])) {
        const playerEntityRef = this._world.colliderEntityRegistry.get(playerColliderHandle)!!
        this._world.entityManager.addComponent(playerEntityRef, KnockBack)
        KnockBack.x[playerEntityRef] = EnemyActiveAttack.targetX[this._ownerRef]
        KnockBack.y[playerEntityRef] = EnemyActiveAttack.targetY[this._ownerRef]
        KnockBack.duration[playerEntityRef] = 30

        this.performAttack()
        this.finishAttack()
        return
      }
    }

    this.moveToTarget()
  }

  protected performAttack(): void {
    // TODO: if enemy is close to target, ram player and deal damage
  }

  private moveToTarget() {
    const enemyBody = this._world.physicsWorld.bodies.get(PhysicsRefs.rigidBodyRef[this._ownerRef])!
    ENEMY_POSITION_BUFFER.from(enemyBody.translation())
    PLAYER_POSITION_BUFFER.set(EnemyActiveAttack.targetX[this._ownerRef], EnemyActiveAttack.targetY[this._ownerRef]).scale(RAM_SPEED * this._deltaTime)
    ENEMY_POSITION_BUFFER.add(PLAYER_POSITION_BUFFER)
    enemyBody.setTranslation(ENEMY_POSITION_BUFFER, true)
  }

  private checkCollidingWithPlayer(playerColliderHandle: number, enemyColliderHandle: number) {
    let colliding = false

    this._world.physicsWorld.narrowPhase.contactPair(playerColliderHandle, enemyColliderHandle, () => colliding = true)

    return colliding
  }

}