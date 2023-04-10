import { Filter, ISystemConstructor } from '@p228/ecs'
import { InputProvider, PrevTransformSystem, Transform2d } from '@p228/engine'
import { Physics2dConfig, Physics2dWorld, PhysicsRefs, Rapier2D } from '@p228/physics2d'
import { KnockBack } from './features/attack/components/effects/knock-back'
import { Health } from './features/attack/components/health'
import { KnockBackSystem } from './features/attack/systems/effects/knock-back-system'
import { Enemy } from './features/enemy/components/enemy'
import { EnemyActiveAttack } from './features/enemy/components/enemy-active-attack'
import { EnemyAttack } from './features/enemy/components/enemy-attack'
import { EnemyAiSystem } from './features/enemy/systems/enemy-ai-system'
import { Player } from './features/player/components/player'
import { PlayerConnectionSystem } from './features/player/systems/player-connection-system'
import { PlayerInputSystem } from './features/player/systems/player-input-system'
import { PlayerMovementSystem } from './features/player/systems/player-movement-system'

export class SurvivorWorld extends Physics2dWorld {
  public filterPlayer!: Filter
  public filterEnemy!: Filter

  constructor(physicsConfig: Physics2dConfig, inputProvider: InputProvider, rapierInstance: Rapier2D) {
    super(physicsConfig, inputProvider, rapierInstance)
  }

  public registerComponents() {
    return [
      Transform2d,
      PhysicsRefs,
      Player,
      Enemy,
      Health,
      EnemyAttack,
      EnemyActiveAttack,
      KnockBack,
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
      // EnemyMovementSystem,
      EnemyAiSystem,
      KnockBackSystem,
    ]
  }

  protected override onBeforeInitialize() {
    this.filterPlayer = this.registerFilter(new Filter([ Player ]))
    this.filterEnemy = this.registerFilter(new Filter([ Enemy ]))
  }
}