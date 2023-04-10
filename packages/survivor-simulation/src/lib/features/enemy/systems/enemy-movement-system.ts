import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { IVector2Like } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Enemy } from '../components/enemy'

export class EnemyMovementSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _enemyFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)
    this._enemyFilter = world.registerFilter(new Filter([ Enemy, Transform2d, PhysicsRefs ]))
  }

  public override update() {
    const physicsWorld = this.world.physicsWorld
    const entities = this._enemyFilter.entities

    let translation: IVector2Like

    for (const entityRef of entities) {
      const rigidBody = physicsWorld.bodies.get(PhysicsRefs.rigidBodyRef[entityRef])!
      if (rigidBody === undefined) throw new Error('RigidBody not found')
      translation = rigidBody.translation()
      Transform2d.x[entityRef] = translation.x
      Transform2d.y[entityRef] = translation.y
    }
  }
}