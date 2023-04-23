import i18next from 'i18next'
import { Assets, BitmapText, Container, Sprite, Spritesheet } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'
import { GameSceneAssets } from '../../../resource-manifest'
import { TIMER_FONT } from './timer'

export class HUDWaves extends Container {
  private readonly _bgSprite: Sprite
  private readonly _wavesText: BitmapText

  private _wave = 0

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super()
    const miscSpritesheet = Assets.get(GameSceneAssets.Misc) as Spritesheet
    this._bgSprite = Sprite.from(miscSpritesheet.textures['HUDPlate'])
    this.addChild(this._bgSprite)

    this._wavesText = new BitmapText('0', {fontName: TIMER_FONT, align: 'center'})
    this._wavesText.anchor.set(0, 1)
    this.addChild(this._wavesText)

    this.onResize()

    this._gameRenderer.resizer.addResizeListener(this.onResize)
  }

  public setWave(current: number, max: number): void {
    if (this._wave === current) return
    this._wave = current
    this._wavesText.text = `${i18next.t('wave').toUpperCase()}: ${current} / ${max}`
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  private readonly onResize = () => {
    this._bgSprite.width = this._gameRenderer.resizer.dvh(442 / 2)
    this._bgSprite.height = this._gameRenderer.resizer.dvh(118 / 2)

    this.x = this._gameRenderer.resizer.width - this._gameRenderer.resizer.dvh(20) - this._bgSprite.width
    this.y = this._gameRenderer.resizer.dvh(30)

    this._wavesText.fontSize = this._gameRenderer.resizer.dvh(26)
    this._wavesText.x = this._bgSprite.width / 2 - this._wavesText.width / 2
    this._wavesText.y = this._bgSprite.height - this._gameRenderer.resizer.dvh(23 )
  }
}