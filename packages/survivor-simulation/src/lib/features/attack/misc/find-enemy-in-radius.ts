import type { Collider, ColliderHandle, Shape } from '@dimforge/rapier2d'
import { EntityRef } from '@p228/ecs'
import { IVector2Like, Vector2 } from '@p228/math'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { CollisionGroups } from '../../../collision-groups'

const ENEMY_COLLIDERS = new Array<Collider>()
const SHAPES_MAP = new Map<number, Shape>()

function getShape(radius: number, world: SurvivorWorld) {
  let shape = SHAPES_MAP.get(radius)
  if (!shape) {
    shape = new world.rapierInstance.Ball(radius)
    SHAPES_MAP.set(radius, shape)
  }
  return shape
}

function getEnemyColliders(center: IVector2Like, radius: number, world: SurvivorWorld) {
  ENEMY_COLLIDERS.length = 0
  const shape = getShape(radius, world)

  world.physicsWorld.intersectionsWithShape(center, 0, shape, (collider) => {
    ENEMY_COLLIDERS.push(collider)
    return true
  }, undefined, CollisionGroups.ShootableEnemy)

  return ENEMY_COLLIDERS
}

function getClosestColliderHandle(center: IVector2Like, colliders: Array<Collider>) {
  let closestDistanceSquared = Infinity
  let closestColliderHandle = undefined

  for (const collider of colliders) {
    const distanceSquared = Vector2.DistanceSquared(center, collider.translation())
    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared
      closestColliderHandle = collider.handle
    }
  }

  return closestColliderHandle
}

export function findClosestEnemyInRadius(
  world: SurvivorWorld,
  center: IVector2Like,
  radius: number,
): number | undefined {
  const colliders = getEnemyColliders(center, radius, world)
  if (colliders.length === 0) return undefined

  return getClosestColliderHandle(center, colliders)
}

export function findClosestEnemyInRadiusOptimal(
  world: SurvivorWorld,
  attackEntityRef: EntityRef,
  center: IVector2Like,
  radius: number,
  attachedTargets: Array<ColliderHandle>,
): number | undefined {
  const colliders = getEnemyColliders(center, radius, world)
  if (colliders.length === 0) return undefined

  colliders.sort((a, b) => {
    return Vector2.DistanceSquared(center, a.translation()) - Vector2.DistanceSquared(center, b.translation())
  })

  for (const collider of colliders) {
    if (attachedTargets.indexOf(collider.handle) === -1) {
      return collider.handle
    }
  }

  return attachedTargets[attackEntityRef % attachedTargets.length]
}


//
// const ENEMY_COLLIDERS = new Array<Collider>()
// const SHAPES_MAP = new Map<number, Shape>()
//
// export function findClosestEnemyInRadius(
//   world: SurvivorWorld,
//   center: IVector2Like,
//   radius: number,
// ): number | undefined {
//   ENEMY_COLLIDERS.length = 0
//
//   let shape = SHAPES_MAP.get(radius)
//   if (!shape) {
//     shape = new world.rapierInstance.Ball(radius)
//     SHAPES_MAP.set(radius, shape)
//   }
//
//   world.physicsWorld.intersectionsWithShape(
//     center,
//     0,
//     shape,
//     (collider) => {
//       ENEMY_COLLIDERS.push(collider)
//       return true
//     })
//
//   if (ENEMY_COLLIDERS.length === 0) return undefined
//
//   let closestDistanceSquared = Infinity
//   let closestColliderHandle = undefined
//
//   for (const collider of ENEMY_COLLIDERS) {
//     const distanceSquared = Vector2.DistanceSquared(center, collider.translation())
//     if (distanceSquared < closestDistanceSquared) {
//       closestDistanceSquared = distanceSquared
//       closestColliderHandle = collider.handle
//     }
//   }
//
//   return closestColliderHandle
// }
//
// export function findClosestEnemyInRadiusOptimal(
//   world: SurvivorWorld,
//   attackEntityRef: EntityRef,
//   center: IVector2Like,
//   radius: number,
//   attachedTargets: Array<ColliderHandle>,
// ): number | undefined {
//   ENEMY_COLLIDERS.length = 0
//
//   let shape = SHAPES_MAP.get(radius)
//   if (!shape) {
//     shape = new world.rapierInstance.Ball(radius)
//     SHAPES_MAP.set(radius, shape)
//   }
//
//   world.physicsWorld.intersectionsWithShape(
//     center,
//     0,
//     shape,
//     (collider) => {
//       ENEMY_COLLIDERS.push(collider)
//       return true
//     })
//
//   if (ENEMY_COLLIDERS.length === 0) return undefined
//
//   // order enemies by distance
//   ENEMY_COLLIDERS.sort((a, b) => {
//     return Vector2.DistanceSquared(center, a.translation()) - Vector2.DistanceSquared(center, b.translation())
//   })
//
//   for (const collider of ENEMY_COLLIDERS) {
//     if (attachedTargets.indexOf(collider.handle) === -1) {
//       return collider.handle
//     }
//   }
//
//   return attachedTargets[attackEntityRef % attachedTargets.length]
// }
