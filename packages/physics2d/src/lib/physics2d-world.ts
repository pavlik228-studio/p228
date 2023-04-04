import { CollisionContacts } from './collision-contacts'
import { Physics2dConfig } from './physics-config'
import { Rapier2D } from './types'
import { InputProvider, SimulationWorld, SnapshotHistory } from '@p228/engine'

export abstract class Physics2dWorld extends SimulationWorld {
  public readonly collisionContacts = new CollisionContacts()
  private readonly _initialPhysicsSnapshot: ArrayBuffer
  private readonly _physicsSnapshotHistory: SnapshotHistory
  private readonly _physicsEventQueue: InstanceType<Rapier2D['EventQueue']>

  constructor(
    public readonly physicsConfig: Physics2dConfig,
    inputProvider: InputProvider,
    public readonly rapierInstance: Rapier2D,
  ) {
    super(physicsConfig, inputProvider)
    this._physicsWorld = new rapierInstance.World(physicsConfig.gravity)
    this._physicsWorld.timestep = physicsConfig.deltaTime / 1000
    this._physicsEventQueue = new rapierInstance.EventQueue(false)
    this.initializeInternal()
    this._initialPhysicsSnapshot = this._physicsWorld.takeSnapshot().buffer
    this._physicsSnapshotHistory = new SnapshotHistory(physicsConfig.snapshotHistoryLength)
  }

  private _physicsWorld: InstanceType<Rapier2D['World']>

  public get physicsWorld(): InstanceType<Rapier2D['World']> {
    return this._physicsWorld
  }

  protected override saveSnapshot(tick: number) {
    super.saveSnapshot(tick)
    this._physicsSnapshotHistory.set(tick, this._physicsWorld.takeSnapshot().buffer)
  }

  protected override updateSystems() {
    this._physicsWorld.step(this._physicsEventQueue)

    this.collisionContacts.clear()
    this._physicsEventQueue.drainCollisionEvents(this.drainCollisionEventsHandler)

    super.updateSystems()
  }

  private drainCollisionEventsHandler = (collider1: number, collider2: number) => {
    this.collisionContacts.register(collider1, collider2)
  }

  protected override rollback(tick: number) {
    super.rollback(tick)

    let physicsSnapshot: ArrayBuffer

    try {
      physicsSnapshot = this._physicsSnapshotHistory.getNearest(tick)
    } catch (e) {
      physicsSnapshot = this._initialPhysicsSnapshot
    }

    this._physicsWorld = this.rapierInstance.World.restoreSnapshot(new Uint8Array(physicsSnapshot))
  }
}