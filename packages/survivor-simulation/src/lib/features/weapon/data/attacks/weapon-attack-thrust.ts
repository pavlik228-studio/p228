import type { Collider, Shape } from '@dimforge/rapier2d'
import { Transform2d } from '@p228/engine'
import { IVector2Like, Vector2, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { CollisionGroups } from '../../../../collision-groups'
import { KnockBack } from '../../../attack/components/effects/knock-back'
import { findClosestEnemyInRadiusOptimal } from '../../../attack/misc/find-enemy-in-radius'
import { Weapon } from '../../components/weapon'
import { WeaponAttackType } from '../weapon-type'
import { AbstractWeaponAttack } from './abstract-weapon-attack'

const TARGET_POSITION_BUFFER = new Vector2()
const SHAPES_MAP = new Map<WeaponAttackType, Shape>()

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

    this._world.physicsWorld.intersectionsWithShape(
      shapePosition,
      Transform2d.rotation[this._weaponEntityRef],
      shape,
      this.onIntersection,
      undefined,
      CollisionGroups.ShootableEnemy
    )
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

    attackedEnemies.add(entityRef)

    this._world.entityManager.addComponent(entityRef, KnockBack)

    VECTOR2_BUFFER_1.set(
      Weapon.targetX[this._weaponEntityRef] - Weapon.originX[this._weaponEntityRef],
      Weapon.targetY[this._weaponEntityRef] - Weapon.originY[this._weaponEntityRef]
    ).normalize()
    KnockBack.x[entityRef] = VECTOR2_BUFFER_1.x
    KnockBack.y[entityRef] = VECTOR2_BUFFER_1.y
    KnockBack.duration[entityRef] = 10

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