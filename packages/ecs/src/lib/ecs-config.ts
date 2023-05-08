export class ECSConfig {
  public readonly sec2Tick: number
  constructor(
    public readonly entityPoolSize: number,
    public readonly deltaTime = 1000 / 60,
    public readonly recycledPoolSize = 32,
    public readonly filterPoolSize = 32,
    public readonly memoryBlocks = 32,
    public readonly registrySize = 32,
    public readonly allocatorBuffer = 1024,
  ) {
    this.sec2Tick = 1000 / this.deltaTime
  }
}