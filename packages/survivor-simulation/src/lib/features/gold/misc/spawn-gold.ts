import { EntityRef } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { CollisionGroups } from '../../../collision-groups'
import { Gold } from '../components/gold'

const GOLD_SCATTER_RADIUS = 80

export function spawnGold(world: SurvivorWorld, emitterRef: EntityRef, gold: number, xp: number) {
  const goldEntityRef = world.entityManager.createEntity()

  world.entityManager.addManyComponents(goldEntityRef, [ Gold, Transform2d, PhysicsRefs ])

  Gold.createdAt[goldEntityRef] = world.tick
  Gold.gold[goldEntityRef] = gold
  Gold.xp[goldEntityRef] = xp
  Gold.collectedByRef[goldEntityRef] = -1

  VECTOR2_BUFFER_1.set(Transform2d.x[emitterRef], Transform2d.y[emitterRef])
  VECTOR2_BUFFER_2.set(world.random.nextFloat(-1, 1) * GOLD_SCATTER_RADIUS, world.random.nextFloat(-1, 1) * GOLD_SCATTER_RADIUS)
  VECTOR2_BUFFER_1.add(VECTOR2_BUFFER_2)

  Transform2d.x[goldEntityRef] = Transform2d.prevX[goldEntityRef] = VECTOR2_BUFFER_1.x
  Transform2d.y[goldEntityRef] = Transform2d.prevY[goldEntityRef] = VECTOR2_BUFFER_1.y

  const goldColliderDesc = world.rapierInstance.ColliderDesc.ball(16)
  goldColliderDesc.setCollisionGroups(CollisionGroups.Gold)
  goldColliderDesc.setSensor(true)
  const goldRigidBodyDesc = world.rapierInstance.RigidBodyDesc.fixed()
  goldRigidBodyDesc.setTranslation(VECTOR2_BUFFER_1.x, VECTOR2_BUFFER_1.y)
  const goldRigidBody = world.physicsWorld.createRigidBody(goldRigidBodyDesc)
  const goldCollider = world.createCollider(goldEntityRef, goldColliderDesc, goldRigidBody)

  PhysicsRefs.rigidBodyRef[goldEntityRef] = goldRigidBody.handle
  PhysicsRefs.colliderRef[goldEntityRef] = goldCollider.handle
}