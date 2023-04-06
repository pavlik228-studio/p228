import { EntityRef, Filter } from '@p228/ecs'
import { SimulationWorld } from '@p228/engine'
import { Renderer2D } from '@p228/renderer-2d'
import { Container } from 'pixi.js'
import { EntityView, IEntityViewConstructor } from './entity-view'

export class EntityViewUpdater<TWorld extends SimulationWorld = SimulationWorld, CTX = Renderer2D> extends Container {
  private readonly _entityViewMap = new Map<EntityRef, EntityView<TWorld, CTX>>()
  private readonly _worldEntitiesBuffer = new Map<EntityRef, void>()
  constructor(
    private readonly _ctx: CTX,
    private readonly _world: TWorld,
    private readonly _entityViewFilters: Map<Filter, IEntityViewConstructor<TWorld, CTX>>
  ) {
    super()
  }

  public update(dt: number) {
    this._worldEntitiesBuffer.clear()

    for (const [ filter, View ] of this._entityViewFilters) {
      const entities = filter.entities

      for (const entityRef of entities) {
        this._worldEntitiesBuffer.set(entityRef, undefined)
      }

      for (const entityRef of entities) {
        if (!this._entityViewMap.has(entityRef)) {
          const view = new View(entityRef, this._ctx)
          this._entityViewMap.set(entityRef, view)
          view.onCreate(this._world)
          this.addChild(view)
        } else if (this._worldEntitiesBuffer.has(entityRef)) {
          this._entityViewMap.get(entityRef)!.onUpdate(this._world, dt)
        }
      }
    }
  }

  public dispose(): void {
    this._entityViewMap.forEach((view) => {
      view.destroy(true)
    })

    this._entityViewMap.clear()
  }
}