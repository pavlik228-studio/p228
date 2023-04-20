import type { Collider, Shape } from '@dimforge/rapier2d'
import { Transform2d } from '@p228/engine'
import { IVector2Like, Vector2, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { CollisionGroups } from '../../../../collision-groups'
import { KnockBack } from '../../../attack/components/effects/knock-back'
import { findClosestEnemyInRadiusOptimal } from '../../../attack/misc/find-enemy-in-radius'
import { performDamage } from '../../../attack/misc/perform-damage'
import { Weapon } from '../../components/weapon'
import { calculatePlayerDamage } from '../calculate-player-damage'
import { WeaponAttackType } from '../weapon-type'
import { AbstractWeaponAttack } from './abstract-weapon-attack'

const TARGET_POSITION_BUFFER = new Vector2()
const SHAPES_MAP = new Map<WeaponAttackType, Shape>()
const ENEMY_TO_ATTACK_BUFFER = new Array<number>()

export class WeaponAttackThrust extends AbstractWeaponAttack<WeaponAttackType.Thrust> {
  public readonly attackType = WeaponAttackType.Thrust

  protected findTarget() {
    VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    const optimalTarget = findClosestEnemyInRadiusOptimal(
      this._world,
      this._weaponEntityRef,
      VECTOR2_BUFFER_1,
      this._weaponValues.range,
      this._attackedTargets,
    )

    if (optimalTarget === undefined) return undefined

    this._attackedTargets.push(optimalTarget)

    const enemyPosition = this._world.physicsWorld.colliders.get(optimalTarget)!.translation()
    Weapon.originX[this._weaponEntityRef] = Transform2d.x[this._weaponEntityRef]
    Weapon.originY[this._weaponEntityRef] = Transform2d.y[this._weaponEntityRef]

    const targetPosition = this.calculateTargetDirection(enemyPosition)
    VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef])
    Transform2d.rotation[this._weaponEntityRef] = Vector2.Angle(VECTOR2_BUFFER_1, targetPosition)
    Weapon.targetX[this._weaponEntityRef] = targetPosition.x
    Weapon.targetY[this._weaponEntityRef] = targetPosition.y

    return targetPosition
  }

  protected attack(progress: number, _?: IVector2Like): void {
    const shape = this.getShape()
    const shapePosition = this.getShapePosition(progress)

    Transform2d.x[this._weaponEntityRef] = shapePosition.x
    Transform2d.y[this._weaponEntityRef] = shapePosition.y

    ENEMY_TO_ATTACK_BUFFER.length = 0

    this._world.physicsWorld.intersectionsWithShape(
      shapePosition,
      Transform2d.rotation[this._weaponEntityRef],
      shape,
      this.onIntersection,
      undefined,
      CollisionGroups.ShootableEnemy
    )

    // Attack direction
    VECTOR2_BUFFER_1.set(
      Weapon.targetX[this._weaponEntityRef] - Weapon.originX[this._weaponEntityRef],
      Weapon.targetY[this._weaponEntityRef] - Weapon.originY[this._weaponEntityRef]
    ).normalize()

    for (const enemyEntityRef of ENEMY_TO_ATTACK_BUFFER) {
      const playerEntityRef = Weapon.ownerRef[this._weaponEntityRef]
      const { damage, hasCrit } = calculatePlayerDamage(this._weaponEntityRef, this._world.random.nextFloat())

      performDamage(this._world, enemyEntityRef, playerEntityRef, -damage, hasCrit)

      if (!this._world.entityManager.hasEntity(enemyEntityRef)) continue

      this._world.entityManager.addComponent(enemyEntityRef, KnockBack)
      KnockBack.x[enemyEntityRef] = VECTOR2_BUFFER_1.x
      KnockBack.y[enemyEntityRef] = VECTOR2_BUFFER_1.y
      KnockBack.duration[enemyEntityRef] = 10
    }
  }

  private getShape(): Shape {
    let shape = SHAPES_MAP.get(this._weaponValues.attackType)
    if (shape === undefined) {
      shape = new this._world.rapierInstance.Cuboid(this._weaponValues.width / 2, this._weaponValues.height / 2)
      SHAPES_MAP.set(this._weaponValues.attackType, shape)
    }
    return shape
  }

  private getShapePosition(progress: number): IVector2Like {
    VECTOR2_BUFFER_1.set(Weapon.originX[this._weaponEntityRef], Weapon.originY[this._weaponEntityRef])
    VECTOR2_BUFFER_2.set(Weapon.targetX[this._weaponEntityRef], Weapon.targetY[this._weaponEntityRef])

    return Vector2.Lerp(VECTOR2_BUFFER_1, VECTOR2_BUFFER_2, progress, VECTOR2_BUFFER_1)
  }

  private onIntersection = (collider: Collider) => {
    const attackedEnemies = this._weaponTargetsAttackedPool.get(this._weaponEntityRef)
    const entityRef = this._world.colliderEntityRegistry.get(collider.handle)!

    if (attackedEnemies.indexOf(entityRef) !== -1) return true

    ENEMY_TO_ATTACK_BUFFER.push(entityRef)
    attackedEnemies.add(entityRef)

    return true
  }

  private calculateTargetDirection(target: IVector2Like): IVector2Like {
    TARGET_POSITION_BUFFER.from(target)
    VECTOR2_BUFFER_1.set(Weapon.originX[this._weaponEntityRef], Weapon.originY[this._weaponEntityRef])

    return TARGET_POSITION_BUFFER
      .sub(VECTOR2_BUFFER_1)
      .normalize()
      .scale(this._weaponValues.range)
      .add(VECTOR2_BUFFER_1)
  }

  protected override onAttackEnd(): void {
    super.onAttackEnd()
    this._weaponTargetsAttackedPool.release(this._weaponEntityRef)
  }

}