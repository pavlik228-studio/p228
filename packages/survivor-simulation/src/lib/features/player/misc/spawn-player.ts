import { Rpc, Transform2d } from '@p228/engine'
import { PhysicsRefs } from '@p228/physics2d'
import { PlayerJoinedData } from '../../../input/rpc-datas/player-joined'
import { SurvivorWorld } from '../../../survivor-world'
import { Player } from '../components/player'

export function spawnPlayer(world: SurvivorWorld, rpc: Rpc<PlayerJoinedData>) {
  const rapierInstance = world.rapierInstance
  const physicsWorld = world.physicsWorld
  const entityManager = world.entityManager
  const playerEntityRef = entityManager.createEntity()

  entityManager.addComponent(playerEntityRef, Player)
  entityManager.addComponent(playerEntityRef, Transform2d)
  entityManager.addComponent(playerEntityRef, PhysicsRefs)

  Player.slot[playerEntityRef] = rpc.data.slot
  Player.speed[playerEntityRef] = 0
  Player.direction[playerEntityRef] = 0
  Transform2d.prevX[playerEntityRef] = Transform2d.x[playerEntityRef] = 0
  Transform2d.prevY[playerEntityRef] = Transform2d.y[playerEntityRef] = 0
  Transform2d.prevRotation[playerEntityRef] = Transform2d.rotation[playerEntityRef] = 0

  const playerColliderDesc = rapierInstance.ColliderDesc.capsule(32, 24)
  playerColliderDesc.friction = 0
  playerColliderDesc.setActiveEvents(rapierInstance.ActiveEvents.COLLISION_EVENTS)
  const playerRigidBodyDesc = rapierInstance.RigidBodyDesc.kinematicPositionBased()
  const playerRigidBody = physicsWorld.createRigidBody(playerRigidBodyDesc)
  const playerCollider = world.createCollider(playerEntityRef, playerColliderDesc, playerRigidBody)

  PhysicsRefs.rigidBodyRef[playerEntityRef] = playerRigidBody.handle
  PhysicsRefs.colliderRef[playerEntityRef] = playerCollider.handle
}