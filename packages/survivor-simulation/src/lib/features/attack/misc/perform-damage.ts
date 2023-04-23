import { EntityRef } from '@p228/ecs'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Enemy } from '../../enemy/components/enemy'
import { EnemyAiSystem } from '../../enemy/systems/enemy-ai-system'
import { spawnGold } from '../../gold/misc/spawn-gold'
import { Player } from '../../player/components/player'
import { DamageEvent } from '../../weapon/events/damage'
import { WeaponAiSystem } from '../../weapon/systems/weapon-ai-system'
import { Health } from '../components/health'

let hp = 0

export function performDamage(world: SurvivorWorld, entityRef: EntityRef, damageByRef: EntityRef, damage: number, hasCrit = false): void {
  if (entityRef === undefined) return

  hp = Math.max(0, Health.current[entityRef] + damage)
  Health.current[entityRef] = hp

  // console.log(`[DAMAGE] ${entityRef} ${damageByRef} ${damage} ${hp}`)

  if (hp === 0) {
    if (world.entityManager.hasComponent(entityRef, Enemy)) {
      world.getSystem(EnemyAiSystem).destroyEnemyWeapon(entityRef)
      spawnGold(world, entityRef, 1, 1)
    } else if (world.entityManager.hasComponent(entityRef, Player)) {
      world.getSystem(WeaponAiSystem).destroyPlayerWeapon(entityRef)
    }
    world.destroyCollider(PhysicsRefs.colliderRef[entityRef])
    world.entityManager.destroyEntity(entityRef)

    console.log(`[REMOVE] PhysicsRefs.colliderRef[entityRef]: ${PhysicsRefs.colliderRef[entityRef]} ${entityRef}`)
  }

  world.simulationEvents.emit(DamageEvent, world.tick, { damage, entityRef, damageByRef, hasCrit })
}