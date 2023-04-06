export interface Listener<T> {
  (event: T): void
}

export interface Disposable {
  dispose(): void
}

export class TypedEvent<T> {
  private listeners = new Set<Listener<T>>()
  private listenersOnce = new Set<Listener<T>>()

  public on = (listener: Listener<T>): Disposable => {
    this.listeners.add(listener)
    return {
      dispose: () => this.off(listener),
    }
  }

  public once = (listener: Listener<T>): void => {
    this.listenersOnce.add(listener)
  }

  public off = (listener: Listener<T>) => {
    this.listeners.delete(listener)
  }

  public emit = (event: T) => {
    /** Update any general listeners */
    for (const listener of this.listeners) {
      listener(event)
    }

    /** Clear the `once` queue */
    if (this.listenersOnce.size > 0) {
      for (const listener of this.listenersOnce) {
        listener(event)
      }

      this.listenersOnce.clear()
    }
  }

  public offAll(): void {
    this.listeners.clear()
  }

  public pipe = (te: TypedEvent<T>): Disposable => {
    return this.on((e) => te.emit(e))
  }
}
