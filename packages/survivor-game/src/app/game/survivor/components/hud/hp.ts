import { BitmapText, Container } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'
import { PROGRESS_BAR_LABEL_FONT, ProgressBar } from './progress-bar'

export class HUDHp extends Container {
  private readonly _hp: ProgressBar
  private readonly _label: BitmapText

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super()
    this._hp = new ProgressBar(_gameRenderer, 0xD41818)
    this.addChild(this._hp)

    this._label = new BitmapText('HP', {fontName: PROGRESS_BAR_LABEL_FONT})
    this._label.anchor.set(0.5)
    this.addChild(this._label)

    this.onResize()

    this._gameRenderer.resizer.addResizeListener(this.onResize)
  }

  public setValue(value: number, label: string): void {
    this._hp.updateBar(value)
    this._label.text = label
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  private readonly onResize = () => {
    this.x = this._gameRenderer.resizer.dvh(20)
    this.y = this._gameRenderer.resizer.height - this._gameRenderer.resizer.dvh(40)

    this._label.x = this._hp.fullWidth / 2
    this._label.fontSize = this._gameRenderer.resizer.dvh(18)
    this._label.y = this._label.height / 2 - this._gameRenderer.resizer.dvh(2)
  }
}