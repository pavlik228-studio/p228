import { EntityRef } from '@p228/ecs'
import { SimulationWorld } from '@p228/engine'
import { Renderer2D } from '@p228/renderer-2d'
import { Container } from 'pixi.js'

export abstract class EntityView<T extends SimulationWorld, CTX = Renderer2D> extends Container {
  constructor(
    public readonly entityRef: EntityRef,
    public readonly ctx: CTX,
  ) {
    super()
  }

  public abstract onCreate(world: T): void

  public abstract onUpdate(world: T, dt: number): void

  public abstract onDestroy(world: T): void
}

export interface IEntityViewConstructor<T extends SimulationWorld, CTX = Renderer2D> {
  new(entityRef: EntityRef, ctx: CTX): EntityView<T, CTX>
}