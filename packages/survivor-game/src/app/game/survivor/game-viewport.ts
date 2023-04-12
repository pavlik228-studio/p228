import { Viewport } from 'pixi-viewport'
import { GameRenderer } from '../game-renderer'

const REFERENCE_SIZE = 1000

export class GameViewport extends Viewport {
  constructor(private readonly _renderer: GameRenderer) {
    super({
      screenWidth: _renderer.resizer.width,
      screenHeight: _renderer.resizer.height,
      events: _renderer.renderer.events,
    })

    this.wheel()

    this.zoomAspectRatio()
    this.moveCenter(0, 0)

    this._renderer.resizer.addResizeListener(this.onResize)
  }

  private zoomAspectRatio(): void {
    const { width, height } = this._renderer.resizer
    const size = Math.min(width, height)
    const scale = size / REFERENCE_SIZE

    this.setZoom(scale)
  }

  private readonly onResize = () => {
    this.zoomAspectRatio()
    this.resize(this._renderer.resizer.width, this._renderer.resizer.height)
  }
}