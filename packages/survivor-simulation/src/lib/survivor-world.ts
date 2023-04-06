import { Filter, ISystemConstructor } from '@p228/ecs'
import { InputProvider, PrevTransformSystem, Transform2d } from '@p228/engine'
import { Physics2dConfig, Physics2dWorld, PhysicsRefs, Rapier2D } from '@p228/physics2d'
import { Player } from './features/player/components/player'
import { PlayerConnectionSystem } from './features/player/systems/player-connection-system'
import { PlayerInputSystem } from './features/player/systems/player-input-system'
import { PlayerMovementSystem } from './features/player/systems/player-movement-system'

export class SurvivorWorld extends Physics2dWorld {
  public filterPlayer!: Filter

  constructor(physicsConfig: Physics2dConfig, inputProvider: InputProvider, rapierInstance: Rapier2D) {
    super(physicsConfig, inputProvider, rapierInstance)
  }

  public registerComponents() {
    return [
      Transform2d,
      PhysicsRefs,
      Player,
    ]
  }

  public registerSingletonComponents() {
    return []
  }

  public registerSystems(): Array<ISystemConstructor<any>> {
    return [
      PrevTransformSystem,
      PlayerConnectionSystem,
      PlayerInputSystem,
      PlayerMovementSystem,
    ]
  }

  protected override onBeforeInitialize() {
    this.filterPlayer = this.registerFilter(new Filter([ Player ]))
    console.log('SurvivorWorld.onBeforeInitialize()')
  }
}