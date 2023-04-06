import { Stage } from '@pixi/layers'
import { Renderer, Ticker } from 'pixi.js'
import { IGameSceneConstructor } from './abstract-game-scene'
import { RenderingStats } from './misc/rendering-stats'
import { Resizer } from './resizer'
import { SceneManager } from './scene-manager'

export class Renderer2D {
  public readonly stage: Stage
  public readonly resizer: Resizer
  public readonly renderer: Renderer
  private readonly _ticker: Ticker
  private readonly _disposables = new Set<() => void>()
  private readonly _sceneManager: SceneManager
  private readonly _renderingStats = new RenderingStats()

  get sceneManager(): SceneManager {
    return this._sceneManager
  }

  constructor(
    private readonly _renderCanvas: HTMLCanvasElement,
    private readonly _startSceneConstructor: IGameSceneConstructor,
  ) {
    const viewport = Resizer.getViewport(this._renderCanvas)

    this.renderer = new Renderer({
      eventMode: 'static',
      antialias: true,
      autoDensity: true,
      view: _renderCanvas,
      width: viewport.width,
      height: viewport.height,
      backgroundColor: 0x000000,
      powerPreference: 'high-performance',
      resolution: Resizer.getDevicePixelRatio(),
    })
    this.resizer = new Resizer(this.renderer, this._renderCanvas)
    this._ticker = new Ticker()
    this.stage = new Stage()
    this._ticker.add(this.update)
    this.resizer.addResizeListener(this.onResize)

    this._ticker.start()
    this._disposables.add(() => this.resizer.removeResizeListener(this.onResize))

    this._sceneManager = new SceneManager(this, _startSceneConstructor)
    this._sceneManager.isReady.then(() => {
      this._ticker.add(this._sceneManager.onUpdate)
    })

    // @ts-ignore
    globalThis['__PIXI_STAGE__'] = this.stage
    // @ts-ignore
    globalThis['__PIXI_RENDERER__'] = this.renderer
  }

  public get deltaTime(): number {
    return this._ticker.deltaMS
  }

  public destroy(): void {
    this._sceneManager.destroy()
    this._ticker.stop()
    this.renderer.destroy()
    this.resizer.destroy()
    this._disposables.forEach(dispose => dispose())
  }

  private readonly onResize = (resizerCtx: Resizer): void => {
    this.renderer.resize(resizerCtx.width, resizerCtx.height)
  }

  private readonly update = (dt: number): void => {
    this._renderingStats.begin()
    this.renderer.render(this.stage)
    this._renderingStats.end()
  }
}