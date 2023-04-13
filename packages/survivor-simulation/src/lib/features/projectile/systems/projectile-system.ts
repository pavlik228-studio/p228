import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Health } from '../../attack/components/health'
import { performDamage } from '../../attack/misc/perform-damage'
import { Projectile } from '../components/projectile'

const REMOVE_LIST = new Array<number>()

export class ProjectileSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _projectileFilter: Filter

  constructor(world: SurvivorWorld) {
    super(world)
    this._projectileFilter = world.registerFilter(new Filter([ Projectile, Transform2d, PhysicsRefs ]))
  }
  public override update(): void {
    const entityManager = this.world.entityManager
    const collisionContactsStarted = this.world.collisionContactsStarted

    for (const projectileEntityRef of this._projectileFilter) {
      const projectileColliderHandle = PhysicsRefs.colliderRef[projectileEntityRef]
      const contact = collisionContactsStarted.findOne(projectileColliderHandle)
      if (!contact) continue

      const otherHandle = contact.otherHandle
      const otherEntityRef = this.world.colliderEntityRegistry.get(otherHandle)!

      if (!entityManager.hasComponent(otherEntityRef, Health)) throw new Error('Projectile hit an entity without health')

      Health.current[otherEntityRef] -= Projectile.damage[projectileEntityRef]

      performDamage(this.world, otherEntityRef, Projectile.ownerRef[projectileEntityRef], -Projectile.damage[projectileEntityRef])

      REMOVE_LIST.push(projectileEntityRef, projectileColliderHandle)
    }

    for (let i = 0; i < REMOVE_LIST.length; i += 2) {
      entityManager.destroyEntity(REMOVE_LIST[i])
      this.world.destroyCollider(REMOVE_LIST[i + 1])
    }

    REMOVE_LIST.length = 0
  }
}