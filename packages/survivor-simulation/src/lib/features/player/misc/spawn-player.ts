import { EntityRef } from '@p228/ecs'
import { Rpc, Transform2d } from '@p228/engine'
import { VECTOR2_BUFFER_1 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { CollisionGroups } from '../../../collision-groups'
import { PlayerJoinedData } from '../../../input/rpc-datas/player-joined'
import { SurvivorWorld } from '../../../survivor-world'
import { Health } from '../../attack/components/health'
import { Player } from '../components/player'

export function spawnPlayer(world: SurvivorWorld, rpc: Rpc<PlayerJoinedData>): EntityRef {
  const rapierInstance = world.rapierInstance
  const physicsWorld = world.physicsWorld
  const entityManager = world.entityManager
  const playerEntityRef = entityManager.createEntity()
  const playerPosition = VECTOR2_BUFFER_1.set(650, 0)

  entityManager.addManyComponents(playerEntityRef, [ Player, Transform2d, PhysicsRefs, Health ])

  Player.slot[playerEntityRef] = rpc.data.slot
  Player.character[playerEntityRef] = rpc.data.character
  Player.luck[playerEntityRef] = 0
  Player.speed[playerEntityRef] = 0
  Player.attackSpeed[playerEntityRef] = 0
  Player.direction[playerEntityRef] = 0
  Player.shopState[playerEntityRef] = world.random.nextFloat()

  Player.goldBalance[playerEntityRef] = 2000
  Player.shopSlots[playerEntityRef] = 3

  Transform2d.prevX[playerEntityRef] = Transform2d.x[playerEntityRef] = playerPosition.x
  Transform2d.prevY[playerEntityRef] = Transform2d.y[playerEntityRef] = playerPosition.y
  Transform2d.prevRotation[playerEntityRef] = Transform2d.rotation[playerEntityRef] = 0

  const playerColliderDesc = rapierInstance.ColliderDesc.capsule(32, 24)
  playerColliderDesc.friction = 0
  playerColliderDesc.setCollisionGroups(CollisionGroups.Player)
  playerColliderDesc.setSolverGroups(CollisionGroups.Player)
  playerColliderDesc.setActiveEvents(rapierInstance.ActiveEvents.COLLISION_EVENTS)
  const playerRigidBodyDesc = rapierInstance.RigidBodyDesc.kinematicPositionBased()
  playerRigidBodyDesc.setTranslation(playerPosition.x, playerPosition.y)
  const playerRigidBody = physicsWorld.createRigidBody(playerRigidBodyDesc)
  const playerCollider = world.createCollider(playerEntityRef, playerColliderDesc, playerRigidBody)

  PhysicsRefs.rigidBodyRef[playerEntityRef] = playerRigidBody.handle
  PhysicsRefs.colliderRef[playerEntityRef] = playerCollider.handle

  Health.max[playerEntityRef] = Health.current[playerEntityRef] = 200

  // spawnWeapon(entityManager, playerEntityRef, WeaponType.EthernalRpg, 1, playerPosition)

  return playerEntityRef
}