import { EntityRef } from '@p228/ecs'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { DamageEvent } from '../../weapon/events/damage'

export function performDamage(world: SurvivorWorld, entityRef: EntityRef, damageByRef: EntityRef, damage: number): void {
  console.log('performDamage', entityRef, damageByRef, damage)

  world.simulationEvents.emit(DamageEvent, world.tick, { damage, entityRef, damageByRef })
}