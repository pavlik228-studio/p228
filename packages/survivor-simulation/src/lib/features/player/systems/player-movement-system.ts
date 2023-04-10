import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { MathOps, Vector2, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '../../../survivor-world'
import { KnockBack } from '../../attack/components/effects/knock-back'
import { Player } from '../components/player'

export class PlayerMovementSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _playerFilter: Filter

  constructor(world: SurvivorWorld) {
    super(world)
    this._playerFilter = world.registerFilter(new Filter([ Player, Transform2d, PhysicsRefs ]))
  }

  public override update() {
    const physicsWorld = this.world.physicsWorld
    const entities = this._playerFilter.entities

    for (const entityRef of entities) {
      const playerRigidBody = physicsWorld.getRigidBody(PhysicsRefs.rigidBodyRef[entityRef])
      const playerTranslation = VECTOR2_BUFFER_2.from(playerRigidBody.translation())
      Transform2d.x[entityRef] = playerTranslation.x
      Transform2d.y[entityRef] = playerTranslation.y
      Transform2d.rotation[entityRef] = Player.direction[entityRef]

      if (this.world.entityManager.hasComponent(entityRef, KnockBack)) continue
      if (Player.speed[entityRef] === 0) continue

      const positionDelta = VECTOR2_BUFFER_1.from(Vector2.Forward).rotate(Transform2d.rotation[entityRef]).scale(MathOps.clamp01(Player.speed[entityRef]) * 6)

      playerTranslation.add(positionDelta)

      playerRigidBody.setNextKinematicTranslation(playerTranslation)
    }
  }
}