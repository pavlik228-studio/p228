interface IDisposable {
  dispose: () => void
}
interface Listener<T> {
  (tick: number, eventData: T): void
}

export class SimulationEvent<T> {
  private listeners = new Set<Listener<T>>()

  public on(listener: Listener<T>): IDisposable {
    this.listeners.add(listener)
    return {
      dispose: () => this.off(listener),
    }
  }

  public off(listener: Listener<T>): void {
    this.listeners.delete(listener)
  }

  public emit(tick: number, event: T): void {
    for (const listener of this.listeners) {
      listener(tick, event)
    }
  }
}
