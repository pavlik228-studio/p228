import { Resizer } from '@p228/renderer-2d'
import { BitmapFont, Container, Graphics } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'

export const PROGRESS_BAR_LABEL_FONT = 'RussoOneProgressLabel'
BitmapFont.from(PROGRESS_BAR_LABEL_FONT, {
  fontFamily: 'Russo One',
  fontWeight: '400',
  fontSize: 60,
  fill: 0xFFFFFF,
  stroke: 0x000000,
  strokeThickness: 2,
}, {
  resolution: Resizer.getDevicePixelRatio(),
  chars: [ 'H', 'P', 'X', 'З', 'Д', 'О', 'Р', 'В', 'Е', 'Ы', 'П', 'Ь', 'Т', ...BitmapFont.NUMERIC, '/', ':', ' ' ], // xp, hp, здоровье, опыт
})

const BG_COLOR = 0x000000

export class ProgressBar extends Container {
  private readonly _graphics: Graphics
  private _value = 1

  constructor(
    private readonly _gameRenderer: GameRenderer,
    private readonly _barColor: number,
  ) {
    super()
    this._graphics = new Graphics()
    this.addChild(this._graphics)

    this.onResize()
    this.updateBar(0)

    this._gameRenderer.resizer.addResizeListener(this.onResize)
  }

  private _fullWidth = 0

  public get fullWidth(): number {
    return this._fullWidth
  }

  private _fullHeight = 0

  public get fullHeight(): number {
    return this._fullHeight
  }

  public updateBar(newValue: number): void {
    if (newValue === this._value) return
    this._value = newValue
    const value = Math.max(0.01, Math.min(1, newValue))
    this._graphics.clear()
    this._graphics.beginFill(BG_COLOR, 0.75)
    this._graphics.drawRoundedRect(0, 0, this._fullWidth, this._fullHeight, 5)
    this._graphics.endFill()

    this._graphics.beginFill(this._barColor)
    this._graphics.drawRoundedRect(0, 0, this._fullWidth * value, this._fullHeight, 5)
    this._graphics.endFill()

    this._graphics.lineStyle(1, 0x000000, 1)
    this._graphics.drawRoundedRect(0, 0, this._fullWidth, this._fullHeight, 5)
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  private readonly onResize = () => {
    this._fullWidth = this._gameRenderer.resizer.dvh(470)
    this._fullHeight = this._gameRenderer.resizer.dvh(22)
  }
}