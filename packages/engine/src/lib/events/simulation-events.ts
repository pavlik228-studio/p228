import { Allocator, DataType, Primitive } from '@p228/ecs'
import { hashSum } from '../misc/hash-sum'
import { SimulationConfig } from '../simulation-config'
import { SimulationEvent } from "./simulations-event"

export interface ISimulationEvents {
  Predicted: ISimulationEventsRegistry
  Verified: ISimulationEventsRegistry
  Canceled: ISimulationEventsRegistry

  emit<T, E extends typeof SimulationEvent<T>>(event: E, tick: number, data: T): void
}

export class SimulationEvents implements ISimulationEvents {
  public readonly _actualEventIdHash = new Map<number, string>()
  private readonly _maxInputLag: number
  private readonly _eventsInternalIdsRegistry = new Map<typeof SimulationEvent<any>, number>()
  private readonly _predictedEvents = new SimulationEventsRegistry()
  private readonly _verifiedEvents = new SimulationEventsRegistry()
  private readonly _canceledEvents = new SimulationEventsRegistry()
  private readonly _tickEventsForVerification = new Map<number, EventForVerification[]>()
  private readonly _eventNextId: Primitive

  constructor(
    private readonly _allocator: Allocator,
    private readonly _config: SimulationConfig,
  ) {
    this._maxInputLag = this._config.maxLagTicks
    this._eventNextId = this._allocator.allocateStruct(Primitive, DataType.u32)
  }

  get Predicted(): ISimulationEventsRegistry {
    return this._predictedEvents
  }

  get Verified(): ISimulationEventsRegistry {
    return this._verifiedEvents
  }

  get Canceled(): ISimulationEventsRegistry {
    return this._canceledEvents
  }

  public register<T>(Event: typeof SimulationEvent<T>): void {
    this._eventsInternalIdsRegistry.set(Event, this._eventsInternalIdsRegistry.size + 1)

    this._predictedEvents.register(Event)
    this._verifiedEvents.register(Event)
    this._canceledEvents.register(Event)
  }

  public emit<T, E extends typeof SimulationEvent<T>>(event: E, tick: number, data: T): void {
    if (!this._eventsInternalIdsRegistry.has(event)) throw new Error(`Event ${event.name} is not registered`)

    const eventId = this._eventNextId.value++

    this._actualEventIdHash.set(eventId, this.getEventHash(event, tick, data))

    this._predictedEvents.emit(event, tick, data)

    if (this._maxInputLag === 0) {
      this._verifiedEvents.emit(event, tick, data)
    } else {
      this.enqueueEvent(eventId, event, tick, data)
    }
  }

  public verify(tick: number): void {
    if (this._maxInputLag === 0) return

    const tickToVerify = Math.max(0, tick - this._maxInputLag)

    if (tickToVerify === 0) return

    const tickEvents = this._tickEventsForVerification.get(tickToVerify)

    if (!tickEvents) return

    for (const [ eventId, event, eventData, eventHash ] of tickEvents) {
      if (this._actualEventIdHash.get(eventId) !== eventHash) {
        this._canceledEvents.emit(event, tickToVerify, eventData)
      } else {
        this._verifiedEvents.emit(event, tickToVerify, eventData)
      }
    }

    this._tickEventsForVerification.delete(tickToVerify)
  }

  private enqueueEvent<T>(eventId: number, event: typeof SimulationEvent<T>, tick: number, data: T): void {
    const tickEvents = this._tickEventsForVerification.get(tick) || []
    tickEvents.push([ eventId, event, data, this.getEventHash(event, tick, data) ])
    this._tickEventsForVerification.set(tick, tickEvents)
  }

  private getEventHash<T>(event: typeof SimulationEvent<T>, tick: number, data: T): string {
    return hashSum([ this._eventsInternalIdsRegistry.get(event), tick, data ])
  }
}

class SimulationEventsRegistry implements ISimulationEventsRegistry {
  private readonly _events = new Map<typeof SimulationEvent<any>, SimulationEvent<any>>()

  public register<T>(Event: typeof SimulationEvent<T>): void {
    this._events.set(Event, new Event())
  }

  public emit<T, E extends typeof SimulationEvent<T>>(event: E, tick: number, data: T): void {
    this._events.get(event)!.emit(tick, data)
  }

  public subscribe<T, E extends typeof SimulationEvent<T>>(event: E, listener: (tick: number, event: T) => void): void {
    this._events.get(event)!.on(listener)
  }

  public unsubscribe<T, E extends typeof SimulationEvent<T>>(event: E, listener: (tick: number, event: T) => void): void {
    this._events.get(event)!.off(listener)
  }

}

interface ISimulationEventsRegistry {
  subscribe: <T>(event: typeof SimulationEvent<T>, listener: (tick: number, data: T) => void) => void
  unsubscribe: <T>(event: typeof SimulationEvent<T>, listener: (tick: number, data: T) => void) => void
}

type EventForVerification = [
  number, // EventId
  typeof SimulationEvent<any>, // Event
  unknown, // EventData
  string // EventHash
]
