import { SimulationConfig } from '@p228/engine'

export class Physics2dConfig extends SimulationConfig {
  constructor(
    entityPoolSize: number,
    public readonly gravity: { x: number, y: number },
    public readonly pixelPerUnit = 1,
    deltaTime?: number,
    maxLagTicks?: number, // How many ticks allowed to lag behind
    snapshotHistoryLength?: number, // How many snapshots to keep in history
    snapshotHistoryRate?: number, // How often to take snapshots (one per 10 ticks by default)
    recycledPoolSize?: number,
    filterPoolSize?: number,
    memoryBlocks?: number,
    registrySize?: number,
    allocatorBuffer?: number,
  ) {
    super(entityPoolSize, deltaTime, recycledPoolSize, filterPoolSize, memoryBlocks, registrySize, allocatorBuffer)
  }
}