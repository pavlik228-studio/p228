import { DataType, ECSWorld, Primitive } from '@p228/ecs'
import { MathOps } from '@p228/math'
import { ISimulationEvents, SimulationEvents } from './events/simulation-events'
import { InputProvider } from './input/input-provider'
import { DeterministicRandom } from './misc/deterministic-random'
import { SnapshotHistory } from './misc/snapshot-history'
import { SimulationConfig } from './simulation-config'

export abstract class SimulationWorld extends ECSWorld {
  private _initialSnapshot: ArrayBuffer
  private _accumulatedTime = 0
  private readonly _frameRate: number
  private readonly _snapshotHistory: SnapshotHistory
  private readonly _simulationEvents: SimulationEvents
  private readonly _deterministicRandom: DeterministicRandom

  constructor(
    public readonly simulationConfig: SimulationConfig,
    public readonly inputProvider: InputProvider,
  ) {
    super(simulationConfig)
    this._tick = this._allocator.allocateStruct(Primitive, DataType.u32)
    this._deterministicRandom = new DeterministicRandom(this._allocator, simulationConfig.seed)
    this._simulationEvents = new SimulationEvents(this._allocator, simulationConfig)
    this.registerEvents(this._simulationEvents)
    this._initialSnapshot = this._allocator.createSnapshot()
    this._frameRate = simulationConfig.deltaTime
    this._snapshotHistory = new SnapshotHistory(simulationConfig.snapshotHistoryLength)
  }

  private _interpolationFactor = 0

  public get interpolationFactor(): number {
    return this._interpolationFactor
  }

  public get random(): DeterministicRandom {
    return this._deterministicRandom
  }

  public get simulationEvents(): ISimulationEvents {
    return this._simulationEvents
  }

  private _tick: Primitive

  public get tick(): number {
    return this._tick.value
  }

  public update(deltaTime: number): void {
    const currentTick = this._tick.value
    this._accumulatedTime += deltaTime
    const toTick = Math.floor(this._accumulatedTime / this._frameRate)

    this.checkAndRollback(currentTick)
    this.simulationTicks(currentTick, toTick)

    this._interpolationFactor = MathOps.clamp01((this._accumulatedTime % this._frameRate) / this._frameRate)
  }

  protected registerEvents(simulationEvents: SimulationEvents): void {
    // Register events here
  }

  protected override onInitialize(): void {
    this._initialSnapshot = this._allocator.createSnapshot()
  }

  protected rollback(tick: number): void {
    let snapshot: ArrayBuffer
    try {
      snapshot = this._snapshotHistory.getNearest(tick)
    } catch (e) {
      snapshot = this._initialSnapshot
      console.warn(`Rollback to tick ${tick} failed, using initial snapshot`)
    }

    this._allocator.applySnapshot(snapshot)

    console.log(`Rollback to tick ${this._tick.value} (${tick})`)
  }

  protected saveSnapshot(tick: number): void {
    const snapshot = this._allocator.createSnapshot()
    this._snapshotHistory.set(tick, snapshot)
  }

  private checkAndRollback(tick: number): void {
    const rollbackTick = this.inputProvider.getInvalidateTick()
    if (rollbackTick === undefined || rollbackTick > tick) return

    this.rollback(rollbackTick)
  }

  private simulationTicks(tick: number, toTick: number): void {
    if (toTick - tick > 1)
      console.warn(
        `Simulation ticks: ${tick} -> ${toTick} (simulate ${
          toTick - tick
        })`,
      )
    while (tick < toTick) {
      this._tick.value = ++tick
      this.updateSystems()
      this._simulationEvents.verify(tick)
      this.storeSnapshotIfNeeded(tick)
    }
  }

  private storeSnapshotIfNeeded(tick: number): void {
    if ((tick % this.simulationConfig.snapshotHistoryRate) === 0) {
      this.saveSnapshot(tick)
    }
  }
}