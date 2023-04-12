import type { RigidBody } from '@dimforge/rapier2d'
import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { MathOps, VECTOR2_BUFFER_1 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Projectile } from '../components/projectile'

const WORLD_BOUNDS_X = 3000
const WORLD_BOUNDS_Y = 3000

export class ProjectileMovementSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _projectileFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)
    this._projectileFilter = world.registerFilter(new Filter([ Projectile, Transform2d, PhysicsRefs ]))
  }

  public override update(): void {
    const physicsWorld = this.world.physicsWorld

    let projectilePosition = VECTOR2_BUFFER_1
    let projectileRigidBody!: RigidBody

    for (const projectileEntityRef of this._projectileFilter) {
      projectileRigidBody = physicsWorld.getRigidBody(PhysicsRefs.rigidBodyRef[projectileEntityRef])

      projectilePosition.from(projectileRigidBody.translation())

      if (projectilePosition.x < -WORLD_BOUNDS_X || projectilePosition.x > WORLD_BOUNDS_X || projectilePosition.y < -WORLD_BOUNDS_Y || projectilePosition.y > WORLD_BOUNDS_Y) {
        this.world.destroyCollider(PhysicsRefs.colliderRef[projectileEntityRef])
        this.world.entityManager.destroyEntity(projectileEntityRef)
        continue
      }

      Transform2d.x[projectileEntityRef] = projectilePosition.x
      Transform2d.y[projectileEntityRef] = projectilePosition.y
      Transform2d.rotation[projectileEntityRef] = MathOps.atan2(Projectile.directionY[projectileEntityRef], Projectile.directionX[projectileEntityRef])
    }
  }
}