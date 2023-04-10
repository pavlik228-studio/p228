import { AbstractSystem, Filter } from '@p228/ecs'
import { VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { KnockBack } from '../../components/effects/knock-back'

const ENTITIES_TO_REMOVE_KNOCK_BACK = new Array<number>()

export class KnockBackSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _knockBackFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)
    this._knockBackFilter = world.registerFilter(new Filter([ KnockBack, PhysicsRefs ]))
  }

  public override update() {
    const physicsWorld = this.world.physicsWorld
    const entities = this._knockBackFilter.entities

    ENTITIES_TO_REMOVE_KNOCK_BACK.length = 0

    for (const entityRef of entities) {
      if (KnockBack.duration[entityRef] === 0) {
        ENTITIES_TO_REMOVE_KNOCK_BACK.push(entityRef)
        continue
      }
      const rigidBody = physicsWorld.bodies.get(PhysicsRefs.rigidBodyRef[entityRef])!
      if (rigidBody === undefined) throw new Error('RigidBody not found')

      const movement = VECTOR2_BUFFER_1.set(KnockBack.x[entityRef], KnockBack.y[entityRef])
      const position = VECTOR2_BUFFER_2.from(rigidBody.translation())

      if (rigidBody.isKinematic()) {
        rigidBody.setNextKinematicTranslation(position.add(movement.scale(this.world.config.deltaTime)))
      } else {
        rigidBody.setLinvel(movement.scale(this.world.config.deltaTime / 1000), true)
      }

      KnockBack.duration[entityRef]--
    }

    for (const entityRef of ENTITIES_TO_REMOVE_KNOCK_BACK) {
      this.world.entityManager.removeComponent(entityRef, KnockBack)
    }
  }
}