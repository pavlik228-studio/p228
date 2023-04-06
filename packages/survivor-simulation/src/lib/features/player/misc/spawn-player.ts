import { Rpc, Transform2d } from '@p228/engine'
import { PhysicsRefs } from '@p228/physics2d'
import { PlayerJoinedData } from '../../../input/rpc-datas/player-joined'
import { SurvivorWorld } from '../../../survivor-world'
import { Player } from '../components/player'

export function spawnPlayer(world: SurvivorWorld, rpc: Rpc<PlayerJoinedData>) {
  const rapierInstance = world.rapierInstance
  const physicsWorld = world.physicsWorld
  const entityManager = world.entityManager
  const playerEntity = entityManager.createEntity()

  entityManager.addComponent(playerEntity, Player)
  entityManager.addComponent(playerEntity, Transform2d)
  entityManager.addComponent(playerEntity, PhysicsRefs)

  Player.slot[playerEntity] = rpc.data.slot
  Player.speed[playerEntity] = 0
  Player.direction[playerEntity] = 0
  Transform2d.prevX[playerEntity] = Transform2d.x[playerEntity] = 0
  Transform2d.prevY[playerEntity] = Transform2d.y[playerEntity] = 0
  Transform2d.prevRotation[playerEntity] = Transform2d.rotation[playerEntity] = 0

  const playerColliderDesc = rapierInstance.ColliderDesc.capsule(32, 24)
  const playerRigidBodyDesc = rapierInstance.RigidBodyDesc.kinematicPositionBased()
  const playerRigidBody = physicsWorld.createRigidBody(playerRigidBodyDesc)
  const playerCollider = physicsWorld.createCollider(playerColliderDesc, playerRigidBody)

  PhysicsRefs.rigidBodyRef[playerEntity] = playerRigidBody.handle
  PhysicsRefs.colliderRef[playerEntity] = playerCollider.handle
}