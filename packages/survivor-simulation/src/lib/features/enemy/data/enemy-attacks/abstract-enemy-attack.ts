import { EntityManager, EntityRef } from '@p228/ecs'
import { Vector2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Enemy } from '../../components/enemy'
import { EnemyActiveAttack } from '../../components/enemy-active-attack'
import { EnemyAttack } from '../../components/enemy-attack'
import { EnemyAttackType, IEnemyAttackValues } from '../enemy-attack-type'

export abstract class AbstractEnemyAttack {
  protected _entityRef!: EntityRef
  protected _ownerRef!: EntityRef
  protected _playerRef!: EntityRef
  protected _playerPosition!: Vector2
  protected _playerColliderHandles!: Array<number>
  protected abstract _attackType: EnemyAttackType
  protected abstract _attackValues: IEnemyAttackValues
  private readonly _entityManager: EntityManager

  constructor(
    protected readonly _world: SurvivorWorld,
  ) {
    this._entityManager = _world.entityManager
  }

  public update() {
    EnemyAttack.cooldown[this._entityRef] = Math.max(0, EnemyAttack.cooldown[this._entityRef] - 1)
    if (EnemyAttack.cooldown[this._entityRef] > 0) return
    // Check if the enemy is attacking
    if (this._entityManager.hasComponent(this._ownerRef, EnemyActiveAttack)) {
      // Check if the enemy is attacking with this attack
      if (EnemyActiveAttack.attackRef[this._ownerRef] !== this._entityRef) return

      // Check if the enemy is charging
      if (EnemyAttack.chargeIn[this._ownerRef] > 0) {
        this.chargeAttack()
      } else {
        this.performAttack()
        this.finishAttack()
      }
    } else {
      if (this.canAttack()) {
        this.startAttack()
      }
    }
  }

  public setContext(attackEntityRef: EntityRef, playerRef: EntityRef, playerPosition: Vector2, playerColliderHandles: Array<number>) {
    this._playerRef = playerRef
    this._entityRef = attackEntityRef
    this._playerPosition = playerPosition
    this._ownerRef = EnemyAttack.ownerRef[attackEntityRef]
    this._playerColliderHandles = playerColliderHandles
  }

  protected abstract canAttack(): boolean

  protected abstract performAttack(): void

  protected startAttack(): void {
    // Set the enemy attack charge in
    EnemyAttack.chargeIn[this._ownerRef] = this._attackValues.chargeTime

    // Set the enemy active attack
    this._entityManager.addComponent(this._ownerRef, EnemyActiveAttack)
    EnemyActiveAttack.attackRef[this._ownerRef] = this._entityRef

    this._world.physicsWorld.bodies.get(PhysicsRefs.rigidBodyRef[this._ownerRef])!.setLinvel(Vector2.Zero, true)
  }

  protected chargeAttack(): void {
    EnemyAttack.chargeIn[this._ownerRef]--
  }

  protected finishAttack(): void {
    // Set the enemy attack cooldown
    Enemy.attackCooldown[this._ownerRef] = 0
    EnemyAttack.cooldown[this._entityRef] = this._attackValues.cooldown

    // Remove the enemy active attack
    this._entityManager.removeComponent(this._ownerRef, EnemyActiveAttack)
  }
}