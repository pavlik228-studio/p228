import { EntityRef, Filter } from '@p228/ecs'
import { InputProvider, SimulationWorld, SnapshotHistory } from '@p228/engine'
import { CollisionContacts } from './collision-contacts'
import { PhysicsRefs } from './components/physics-ref'
import { Physics2dConfig } from './physics-config'
import { Rapier2D } from './types'

export abstract class Physics2dWorld extends SimulationWorld {
  public readonly collisionContactsStarted = new CollisionContacts()
  public readonly colliderEntityRegistry = new Map<number, EntityRef>()
  private readonly _initialPhysicsSnapshot: ArrayBuffer
  private readonly _physicsSnapshotHistory: SnapshotHistory
  private readonly _physicsEventQueue: InstanceType<Rapier2D['EventQueue']>
  private physicsRefsFilter!: Filter

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

  public debugRender() {
    return this._physicsWorld.debugRender()
  }

  public createCollider(entityRef: EntityRef, colliderDesc: InstanceType<Rapier2D['ColliderDesc']>, rigidBody?: InstanceType<Rapier2D['RigidBody']>) {
    const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody)

    this.colliderEntityRegistry.set(collider.handle, entityRef)

    return collider
  }

  public destroyCollider(colliderHandle: number) {
    const collider = this._physicsWorld.getCollider(colliderHandle)

    this.colliderEntityRegistry.delete(colliderHandle)

    this._physicsWorld.removeCollider(collider, true)
  }

  protected override onBeforeInitialize() {
    this.physicsRefsFilter = this.registerFilter(new Filter([ PhysicsRefs ]))
  }

  protected override saveSnapshot(tick: number) {
    super.saveSnapshot(tick)
    this._physicsSnapshotHistory.set(tick, this._physicsWorld.takeSnapshot().buffer)
  }

  protected override updateSystems() {
    this._physicsWorld.step(this._physicsEventQueue)

    this.collisionContactsStarted.clear()
    this._physicsEventQueue.drainCollisionEvents(this.drainCollisionEventsHandler)

    super.updateSystems()
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
    this.resetColliderEntityRegistry()
  }

  private resetColliderEntityRegistry() {
    this.colliderEntityRegistry.clear()
    const entities = this.physicsRefsFilter.entities

    for (const entityRef of entities) {
      this.colliderEntityRegistry.set(PhysicsRefs.colliderRef[entityRef], entityRef)
    }
  }

  private drainCollisionEventsHandler = (collider1: number, collider2: number, isStarted: boolean) => {
    if (!isStarted) return
    this.collisionContactsStarted.register(collider1, collider2)
  }
}