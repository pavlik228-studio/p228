import { TypedEvent } from '@p228/engine'
import { Renderer } from 'pixi.js'

export class Resizer {
  private _resizeId: number | null = null
  private readonly _resizeListeners = new TypedEvent<Resizer>()

  public static getDevicePixelRatio(): number {
    if (window.location.search.indexOf('_dpr=') !== -1) return parseFloat(window.location.search.match(/_dpr=(\d+)/)?.[1] || '1') || 1
    return Math.min(window.devicePixelRatio || 1, 2)
  }

  constructor(
    private readonly _renderer: Renderer,
    private readonly _canvasContainer: HTMLElement,
  ) {
    this.resize()
    window.addEventListener('resize', this.enqueueResize)
  }

  private _width = 0

  get width(): number {
    return this._width
  }

  private _height = 0

  get height(): number {
    return this._height
  }

  public static getViewport(canvasContainer: HTMLElement): { width: number, height: number } {
    const {width, height} = getComputedStyle(canvasContainer)

    return {
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    }
  }

  public dvh(px: number): number {
    return px * this._height / 600
  }

  public mvw(px: number): number {
    return px * this._width / 320
  }

  public projectX(value: number): number {
    return this._width / 2 + value
  }

  public projectY(value: number): number {
    return this._height / 2 - value
  }

  public destroy(): void {
    window.removeEventListener('resize', this.enqueueResize)
  }

  public addResizeListener(listener: (ctx: Resizer) => void): void {
    this._resizeListeners.on(listener)
  }

  public removeResizeListener(listener: (ctx: Resizer) => void): void {
    this._resizeListeners.off(listener)
  }

  public readonly enqueueResize = (): void => {
    if (this._resizeId) cancelAnimationFrame(this._resizeId)
    this._resizeId = requestAnimationFrame(this.resize)
  }

  private readonly resize = (): void => {
    const {width, height} = Resizer.getViewport(this._canvasContainer)
    console.log('resize', width, height)
    this._width = width
    this._height = height
    this._renderer.resize(this._width, this._height)
    this._resizeId = null
    this._resizeListeners.emit(this)
  }
}