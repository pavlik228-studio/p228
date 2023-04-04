import { RingBuffer } from './ring-buffer'

export class SnapshotHistory<T = ArrayBuffer> {
  private readonly _ringBuffer: RingBuffer<T>
  private readonly _tickRingBufferIdxMap = new Map<number, number>()
  private readonly _ringBufferIdxTickMap = new Map<number, number>()

  constructor(private readonly _size: number) {
    this._ringBuffer = new RingBuffer<T>(_size)
  }

  public dispose(): void {
    this._ringBuffer.clear()
    this._tickRingBufferIdxMap.clear()
    this._ringBufferIdxTickMap.clear()
  }

  public set(tick: number, snapshot: T): void {
    const ringBufferIdx = this._ringBuffer.add(snapshot)

    this.tryCleanUpdatedTick(ringBufferIdx)

    this._tickRingBufferIdxMap.set(tick, ringBufferIdx)
    this._ringBufferIdxTickMap.set(ringBufferIdx, tick)
  }

  public get(tick: number): T {
    const ringBufferIdx = this._tickRingBufferIdxMap.get(tick)
    if (ringBufferIdx === undefined)
      throw new Error(`Snapshot for tick ${tick} not found.`)

    const snapshot = this._ringBuffer.get(ringBufferIdx)
    if (snapshot === undefined)
      throw new Error(`Snapshot for tick ${tick} not found.`)

    return snapshot
  }

  public getNearest(tick: number): T {
    const orderedStoredTicks = Array.from(
      this._tickRingBufferIdxMap.keys(),
    ).sort(ticksSortCompareDesc)

    for (let i = 0; i < orderedStoredTicks.length; i++) {
      if (orderedStoredTicks[i] < tick) {
        debugger
        return this.get(orderedStoredTicks[i])
      }
    }

    throw new Error(`Unable to find snapshot for tick ${tick}`)
  }

  private tryCleanUpdatedTick(ringBufferIdx: number): void {
    const tick = this._ringBufferIdxTickMap.get(ringBufferIdx)
    if (tick === undefined) return

    this._tickRingBufferIdxMap.delete(tick)
  }
}

function ticksSortCompareDesc(a: number, b: number): number {
  return b - a
}
