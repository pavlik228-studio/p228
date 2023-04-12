import { Transform2d } from '@p228/engine'
import { IVector2Like, MathOps, VECTOR2_BUFFER_1 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '../../../survivor-world'
import { Projectile, ProjectileType } from '../components/projectile'

export function spawnProjectile(
  world: SurvivorWorld,
  ownerRef: number,
  type: ProjectileType,
  collisionGroup: number,
  position: IVector2Like,
  direction: IVector2Like,
  speed: number,
  damage: number,
): void {
  const deltaTime = world.config.deltaTime
  const rapierInstance = world.rapierInstance
  const physicsWorld = world.physicsWorld
  const entityManager = world.entityManager
  const entityRef = entityManager.createEntity()
  entityManager.addManyComponents(entityRef, [ Projectile, Transform2d, PhysicsRefs ])
  speed = speed / deltaTime * 1000

  Projectile.type[entityRef] = type
  Projectile.ownerRef[entityRef] = ownerRef
  Projectile.directionX[entityRef] = direction.x
  Projectile.directionY[entityRef] = direction.y
  Projectile.speed[entityRef] = speed
  Projectile.damage[entityRef] = damage

  const positionX = Transform2d.prevX[entityRef] = Transform2d.x[entityRef] = position.x
  const positionY = Transform2d.prevY[entityRef] = Transform2d.y[entityRef] = position.y
  Transform2d.prevRotation[entityRef] = Transform2d.rotation[entityRef] = MathOps.atan2(direction.y, direction.x)

  const projectileColliderDesc = rapierInstance.ColliderDesc.ball(6)
  projectileColliderDesc.friction = 0
  projectileColliderDesc.setSensor(true)
  projectileColliderDesc.setCollisionGroups(collisionGroup)
  projectileColliderDesc.setSolverGroups(collisionGroup)
  projectileColliderDesc.setActiveEvents(rapierInstance.ActiveEvents.COLLISION_EVENTS)
  const projectileRigidBodyDesc = rapierInstance.RigidBodyDesc.dynamic()
  projectileRigidBodyDesc.setCcdEnabled(true)
  projectileRigidBodyDesc.setTranslation(positionX, positionY)
  const projectileRigidBody = physicsWorld.createRigidBody(projectileRigidBodyDesc)
  const projectileCollider = world.createCollider(entityRef, projectileColliderDesc, projectileRigidBody)

  PhysicsRefs.rigidBodyRef[entityRef] = projectileRigidBody.handle
  PhysicsRefs.colliderRef[entityRef] = projectileCollider.handle

  projectileRigidBody.setLinvel(VECTOR2_BUFFER_1.from(direction).scale(speed), true)
}