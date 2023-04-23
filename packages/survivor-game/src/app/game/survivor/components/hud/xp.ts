import { BitmapText, Container } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'
import { PROGRESS_BAR_LABEL_FONT, ProgressBar } from './progress-bar'

export class HUDXp extends Container {
  private readonly _xp: ProgressBar
  private readonly _label: BitmapText

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super()
    this._xp = new ProgressBar(_gameRenderer, 0x0bd816)
    this.addChild(this._xp)

    this._label = new BitmapText('XP', {fontName: PROGRESS_BAR_LABEL_FONT})
    this._label.anchor.set(0.5)
    this.addChild(this._label)

    this.onResize()

    this._gameRenderer.resizer.addResizeListener(this.onResize)
  }

  public setValue(value: number, label: string): void {
    this._xp.updateBar(value)
    this._label.text = label
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  private readonly onResize = () => {
    this.x = this._gameRenderer.resizer.width - this._gameRenderer.resizer.dvh(20) - this._xp.fullWidth
    this.y = this._gameRenderer.resizer.height - this._gameRenderer.resizer.dvh(40)

    this._label.x = this._xp.fullWidth / 2
    this._label.fontSize = this._gameRenderer.resizer.dvh(18)
    this._label.y = this._label.height / 2 - this._gameRenderer.resizer.dvh(2)
  }
}