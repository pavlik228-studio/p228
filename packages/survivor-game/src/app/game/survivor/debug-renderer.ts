import { SurvivorWorld } from '@p228/survivor-simulation'
import { Graphics, utils } from 'pixi.js'
import { GameRenderer } from '../game-renderer'

export class DebugRenderer extends Graphics {
  constructor(
    private readonly _world: SurvivorWorld,
    private readonly _renderer: GameRenderer,
  ) {
    super()
    this.x = 0
    this.y = 0

    this._renderer.resizer.addResizeListener(this.onResize)
  }

  public onUpdate(): void {
    const buffers = this._world.debugRender()
    const vtx = buffers.vertices
    const cls = buffers.colors

    this.clear()

    for (let i = 0; i < vtx.length / 4; i += 1) {
      const color = utils.rgb2hex([ cls[i * 8], cls[i * 8 + 1], cls[i * 8 + 2] ])
      this.lineStyle(1.0, color, cls[i * 8 + 3], 0.5, true)
      this.moveTo(vtx[i * 4], -vtx[i * 4 + 1])
      this.lineTo(vtx[i * 4 + 2], -vtx[i * 4 + 3])
    }
  }

  public onDestroy(): void {
    this._renderer.resizer.removeResizeListener(this.onResize)
  }

  private readonly onResize = () => {
    //
  }
}