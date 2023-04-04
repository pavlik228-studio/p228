import { ECSConfig } from '@p228/ecs'

export class SimulationConfig extends ECSConfig {
  constructor(
    entityPoolSize: number,
    deltaTime = 1000 / 60,
    public readonly maxLagTicks = 14, // How many ticks allowed to lag behind
    public readonly snapshotHistoryLength = 32, // How many snapshots to keep in history
    public readonly snapshotHistoryRate = 10, // How often to take snapshots (one per 10 ticks by default)
    recycledPoolSize = 32,
    filterPoolSize = 32,
    memoryBlocks = 16,
    registrySize = 16,
    allocatorBuffer = 1024,
  ) {
    super(entityPoolSize, deltaTime, recycledPoolSize, filterPoolSize, memoryBlocks, registrySize, allocatorBuffer)
  }
}