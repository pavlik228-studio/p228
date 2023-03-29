export class SimulationConfig {
  constructor(
    public readonly deltaTime = 1000 / 60,
    public readonly entityPoolSize = 10
  ) {}
}
