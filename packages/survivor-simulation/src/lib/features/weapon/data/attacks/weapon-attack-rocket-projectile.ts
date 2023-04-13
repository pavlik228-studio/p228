import type { Collider, Shape } from '@dimforge/rapier2d'
import { Transform2d } from '@p228/engine'
import { IVector2Like, Vector2, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { CollisionGroups } from '../../../../collision-groups'
import { findClosestEnemyInRadiusOptimal } from '../../../attack/misc/find-enemy-in-radius'
import { performDamage } from '../../../attack/misc/perform-damage'
import { ProjectileType } from '../../../projectile/components/projectile'
import { bezierInterpolate } from '../../../projectile/misc/interpolate-arc'
import { spawnProjectile } from '../../../projectile/misc/spawn-projectile'
import { Weapon } from '../../components/weapon'
import { ExplosionEvent } from '../../events/explosion'
import { WeaponSystem } from '../../systems/weapon-system'
import { WeaponAttackType } from '../weapon-type'
import { AbstractWeaponAttack } from './abstract-weapon-attack'

const SHAPES_MAP = new Map<number, Shape>()

export class WeaponAttackRocketProjectile extends AbstractWeaponAttack<WeaponAttackType.RocketProjectile> {
  public readonly attackType = WeaponAttackType.RocketProjectile

  protected findTarget(): IVector2Like | undefined {
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

    const targetPosition = this._world.physicsWorld.colliders.get(optimalTarget)!.translation()

    Weapon.originX[this._weaponEntityRef] = Transform2d.x[this._weaponEntityRef]
    Weapon.originY[this._weaponEntityRef] = Transform2d.y[this._weaponEntityRef]
    Weapon.targetX[this._weaponEntityRef] = targetPosition.x
    Weapon.targetY[this._weaponEntityRef] = targetPosition.y

    Transform2d.rotation[this._weaponEntityRef] = Vector2.Angle(VECTOR2_BUFFER_1, targetPosition)

    return targetPosition
  }

  protected override onAttackStart() {
    super.onAttackStart()
    Weapon.itemRef[this._weaponEntityRef] = spawnProjectile(
      this._world,
      this._weaponEntityRef,
      ProjectileType.EthernalRocket,
      0,
      VECTOR2_BUFFER_1.set(Transform2d.x[this._weaponEntityRef], Transform2d.y[this._weaponEntityRef]),
      Vector2.Zero,
      0,
      0,
    )

  }

  protected attack(progress: number, target: IVector2Like | undefined): void {
    const rocketEntityRef = Weapon.itemRef[this._weaponEntityRef]
    const interpolatedArc = bezierInterpolate(
      VECTOR2_BUFFER_1.set(Weapon.originX[this._weaponEntityRef], Weapon.originY[this._weaponEntityRef]),
      VECTOR2_BUFFER_2.set(Weapon.targetX[this._weaponEntityRef], Weapon.targetY[this._weaponEntityRef]),
      this._weaponValues.range,
      progress,
    )

    Transform2d.x[rocketEntityRef] = interpolatedArc.x
    Transform2d.y[rocketEntityRef] = interpolatedArc.y
    Transform2d.rotation[rocketEntityRef] = Vector2.Angle(interpolatedArc, VECTOR2_BUFFER_2)

    WeaponSystem.moveWeapon(this._weaponEntityRef)
  }

  protected override onAttackEnd() {
    super.onAttackEnd()

    this._world.simulationEvents.emit(ExplosionEvent, this._world.tick, {
      x: Weapon.targetX[this._weaponEntityRef],
      y: Weapon.targetY[this._weaponEntityRef],
      radius: this._weaponValues.explosionRadius,
    })

    this.dealDamageInRadius()

    this._world.destroyCollider(PhysicsRefs.colliderRef[Weapon.itemRef[this._weaponEntityRef]])
    this._world.entityManager.destroyEntity(Weapon.itemRef[this._weaponEntityRef])
  }

  private dealDamageInRadius() {
    const shape = this.getExplosionShape(this._weaponValues.explosionRadius)
    const explosionPosition = VECTOR2_BUFFER_1.set(Weapon.targetX[this._weaponEntityRef], Weapon.targetY[this._weaponEntityRef])
    this._world.physicsWorld.intersectionsWithShape(
      explosionPosition,
      0,
      shape,
      this.performDamage,
      undefined,
      CollisionGroups.ShootableEnemy,
      )
  }

  private getExplosionShape(radius: number): Shape {
    let shape = SHAPES_MAP.get(radius)

    if (shape === undefined) {
      shape = new this._world.rapierInstance.Ball(radius)
      SHAPES_MAP.set(radius, shape)
    }

    return shape
  }

  private performDamage = (collider: Collider) => {
    const damageEntityRef = this._world.colliderEntityRegistry.get(collider.handle)!
    performDamage(this._world, damageEntityRef, Weapon.ownerRef[this._weaponEntityRef], -this._weaponValues.baseDamage)

    return true
  }

}