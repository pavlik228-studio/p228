export class EcsConfig {
  constructor(
    public readonly entityPoolSize: number, // Max entities
    public readonly componentPoolSize = Math.max(Math.round(entityPoolSize / 4), 8), // How many components will have data
    public readonly filtersPoolSize = componentPoolSize,
    public readonly memoryBlocks = 16,
    public readonly registrySize = 8,
  ) {}

  public calculateInitialAllocatorByteLength(componentsByteLength: number) {
    return this.entityPoolSize * this.componentPoolSize * componentsByteLength
  }
}