import { EntityRef } from '@p228/ecs'
import { SimulationEvent } from '@p228/engine'

export interface DamageEventData {
  damage: number
  entityRef: EntityRef
  damageByRef: EntityRef
}

export class DamageEvent extends SimulationEvent<DamageEventData> {
}