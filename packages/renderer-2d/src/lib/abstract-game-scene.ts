import { Container } from 'pixi.js'
import { Renderer2D } from './renderer-2d'

export interface IGameSceneConstructor {
  new (_renderer: Renderer2D): AbstractGameScene
}

export abstract class AbstractGameScene extends Container {
  constructor(protected readonly _renderer: Renderer2D) {
    super()
  }
  public abstract onUpdate(dt: number): void
  public onLoad(): Promise<void> | void {
    return undefined
  }
  public onAwake(): Promise<void> | void {
    return undefined
  }
  public onDestroy(): void {
    this.destroy()
  }
}