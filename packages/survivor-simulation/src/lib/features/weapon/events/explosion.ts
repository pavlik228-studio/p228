import { SimulationEvent } from '@p228/engine'

export interface ExplosionEventData {
  x: number
  y: number
  radius: number
}

export class ExplosionEvent extends SimulationEvent<ExplosionEventData> {
}