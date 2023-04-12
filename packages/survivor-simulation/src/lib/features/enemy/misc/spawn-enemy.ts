import { Transform2d } from '@p228/engine'
import { IVector2Like } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { CollisionGroups } from '../../../collision-groups'
import { Health } from '../../attack/components/health'
import { Enemy } from '../components/enemy'
import { EnemyAttack } from '../components/enemy-attack'
import { EnemyData, EnemyType } from '../data/enemy-type'

export function spawnEnemy(world: SurvivorWorld, enemyType: EnemyType, position: IVector2Like) {
  const enemyValues = EnemyData.get(enemyType)!
  const rapierInstance = world.rapierInstance
  const physicsWorld = world.physicsWorld
  const entityManager = world.entityManager
  const entityRef = entityManager.createEntity()
  entityManager.addManyComponents(entityRef, [ Enemy, Health, Transform2d, PhysicsRefs ])

  Enemy.type[entityRef] = enemyType

  const positionX = Transform2d.prevX[entityRef] = Transform2d.x[entityRef] = position.x
  const positionY = Transform2d.prevY[entityRef] = Transform2d.y[entityRef] = position.y
  Transform2d.prevRotation[entityRef] = Transform2d.rotation[entityRef] = 0

  Health.max[entityRef] = Health.current[entityRef] = 100

  const enemyColliderDesc = rapierInstance.ColliderDesc.ball(enemyValues.collider.radius)
  enemyColliderDesc.friction = 0
  enemyColliderDesc.setCollisionGroups(CollisionGroups.Enemy)
  enemyColliderDesc.setSolverGroups(CollisionGroups.Enemy)
  enemyColliderDesc.setActiveEvents(rapierInstance.ActiveEvents.COLLISION_EVENTS)
  const enemyRigidBodyDesc = rapierInstance.RigidBodyDesc.dynamic()
  enemyRigidBodyDesc.linearDamping = 0.5
  enemyRigidBodyDesc.lockRotations()
  enemyRigidBodyDesc.setTranslation(positionX, positionY)
  const enemyRigidBody = physicsWorld.createRigidBody(enemyRigidBodyDesc)
  const enemyCollider = world.createCollider(entityRef, enemyColliderDesc, enemyRigidBody)

  PhysicsRefs.rigidBodyRef[entityRef] = enemyRigidBody.handle
  PhysicsRefs.colliderRef[entityRef] = enemyCollider.handle

  for (const attackType of enemyValues.attacks) {
    const enemyAttackEntityRef = entityManager.createEntity()
    entityManager.addComponent(enemyAttackEntityRef, EnemyAttack)
    EnemyAttack.ownerRef[enemyAttackEntityRef] = entityRef
    EnemyAttack.type[enemyAttackEntityRef] = attackType
  }
}