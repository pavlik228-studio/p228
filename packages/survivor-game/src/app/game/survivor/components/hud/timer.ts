import { Resizer } from '@p228/renderer-2d'
import { BitmapFont, BitmapText } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'

export const TIMER_FONT = 'RussoOneTimer'

BitmapFont.from(TIMER_FONT, {
  fontFamily: 'Russo One',
  fontWeight: '400',
  fontSize: 100,
  fill: 0xFFFFFF,
  stroke: 0x000000,
  strokeThickness: 4,
  dropShadow: true,
  dropShadowColor: 0x000000,
  dropShadowBlur: 3,
  dropShadowAngle: Math.PI / 2,
  dropShadowDistance: 2,
}, {
  resolution: Resizer.getDevicePixelRatio(),
  chars: [ ...BitmapFont.NUMERIC, ' ', ':', '.', '/', 'W', 'A', 'V', 'E', 'В', 'О', 'Л', 'Н', 'А', ],
})

export class HUDTimer extends BitmapText {
  private _seconds = 0

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super('0:00', { fontName: TIMER_FONT, letterSpacing: 4 })
    this.anchor.set(0.5, 0)
    this.x = _gameRenderer.resizer.projectX(0)
    _gameRenderer.resizer.addResizeListener(this.onResize)
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  public setSeconds(seconds: number): void {
    if (seconds === this._seconds) return
    this._seconds = seconds
    const minutes = Math.floor(seconds / 60)
    const secondsLeft = seconds % 60
    this.text = `${minutes}:${secondsLeft.toString().padStart(2, '0')}`
  }

  private readonly onResize = () => {
    this.x = this._gameRenderer.resizer.projectX(0)
    this.y = this._gameRenderer.resizer.dvh(30)
    this.fontSize = this._gameRenderer.resizer.dvh(50)
  }
}