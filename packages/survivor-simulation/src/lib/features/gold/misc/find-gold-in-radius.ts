import type { Collider, Shape } from '@dimforge/rapier2d'
import { IVector2Like } from '@p228/math'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { CollisionGroups } from '../../../collision-groups'

const GOLD_COLLIDER_HANDLE_BUFFER = new Array<Collider>()
const SHAPES_MAP = new Map<number, Shape>()

export function findGoldInRadius(world: SurvivorWorld, radius: number, position: IVector2Like): Array<Collider> {
  GOLD_COLLIDER_HANDLE_BUFFER.length = 0

  const shape = getOrCreateShape(world, radius)

  world.physicsWorld.intersectionsWithShape(position, 0, shape, goldIntersectionHandler, void 0, CollisionGroups.Gold)

  return GOLD_COLLIDER_HANDLE_BUFFER
}

function goldIntersectionHandler(collider: Collider): boolean {
  GOLD_COLLIDER_HANDLE_BUFFER.push(collider)
  return true
}

function getOrCreateShape(world: SurvivorWorld, radius: number): Shape {
  let shape = SHAPES_MAP.get(radius)
  if (!shape) {
    shape = new world.rapierInstance.Ball(radius)
    SHAPES_MAP.set(radius, shape)
  }
  return shape
}