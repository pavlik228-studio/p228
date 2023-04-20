import { Allocator, Filter, ISystemConstructor } from '@p228/ecs'
import { InputProvider, PrevTransformSystem, SimulationEvents, Transform2d } from '@p228/engine'
import { Physics2dConfig, Physics2dWorld, PhysicsRefs, Rapier2D } from '@p228/physics2d'
import { KnockBack } from './features/attack/components/effects/knock-back'
import { Health } from './features/attack/components/health'
import { KnockBackSystem } from './features/attack/systems/effects/knock-back-system'
import { Enemy } from './features/enemy/components/enemy'
import { EnemyActiveAttack } from './features/enemy/components/enemy-active-attack'
import { EnemyAttack } from './features/enemy/components/enemy-attack'
import { EnemyAiSystem } from './features/enemy/systems/enemy-ai-system'
import { Gameplay } from './features/gameplay/gameplay.component'
import { Item } from './features/item/components/item'
import { Player } from './features/player/components/player'
import { PlayerConnectionSystem } from './features/player/systems/player-connection-system'
import { PlayerInputSystem } from './features/player/systems/player-input-system'
import { PlayerMovementSystem } from './features/player/systems/player-movement-system'
import { PlayerShopSystem } from './features/player/systems/player-shop-system'
import { Projectile } from './features/projectile/components/projectile'
import { ProjectileMovementSystem } from './features/projectile/systems/projectile-movement-system'
import { ProjectileSystem } from './features/projectile/systems/projectile-system'
import { Weapon } from './features/weapon/components/weapon'
import { DamageEvent } from './features/weapon/events/damage'
import { ExplosionEvent } from './features/weapon/events/explosion'
import { WeaponAiSystem } from './features/weapon/systems/weapon-ai-system'
import { WeaponSystem } from './features/weapon/systems/weapon-system'

export class SurvivorWorld extends Physics2dWorld {
  public filterPlayer!: Filter
  public filterEnemy!: Filter
  public filterProjectile!: Filter
  public filterWeapon!: Filter
  public filterItem!: Filter

  constructor(physicsConfig: Physics2dConfig, inputProvider: InputProvider, rapierInstance: Rapier2D) {
    super(physicsConfig, inputProvider, rapierInstance)
  }

  protected override registerEvents(simulationEvents: SimulationEvents) {
    super.registerEvents(simulationEvents)

    simulationEvents.register(ExplosionEvent)
    simulationEvents.register(DamageEvent)
  }

  public get allocator(): Allocator {
    return this._allocator
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
      Projectile,
      Weapon,
      Item,
    ]
  }

  public registerSingletonComponents() {
    return [
      Gameplay,
    ]
  }

  public registerSystems(): Array<ISystemConstructor<any>> {
    return [
      PrevTransformSystem,
      PlayerConnectionSystem,
      PlayerShopSystem,
      PlayerInputSystem,
      PlayerMovementSystem,
      EnemyAiSystem,
      KnockBackSystem,
      ProjectileSystem,
      ProjectileMovementSystem,
      WeaponSystem,
      WeaponAiSystem,
    ]
  }

  protected override onBeforeInitialize() {
    this.filterPlayer = this.registerFilter(new Filter([ Player ]))
    this.filterEnemy = this.registerFilter(new Filter([ Enemy ]))
    this.filterProjectile = this.registerFilter(new Filter([ Projectile, Transform2d, PhysicsRefs ]))
    this.filterWeapon = this.registerFilter(new Filter([ Weapon, Transform2d ]))
    this.filterItem = this.registerFilter(new Filter([ Item ]))
  }
}