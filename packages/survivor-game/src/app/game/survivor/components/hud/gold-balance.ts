import { Assets, BitmapText, Container, Sprite, Spritesheet } from 'pixi.js'
import { GameRenderer } from '../../../game-renderer'
import { GameSceneAssets } from '../../../resource-manifest'
import { TIMER_FONT } from './timer'

export class HUDGoldBalance extends Container {
  private readonly _bgSprite: Sprite
  private readonly _goldIcon: Sprite
  private readonly _balanceText: BitmapText

  private _balance = 0

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super()
    const miscSpritesheet = Assets.get(GameSceneAssets.Misc) as Spritesheet
    this._bgSprite = Sprite.from(miscSpritesheet.textures['HUDPlate'])
    this.addChild(this._bgSprite)

    this._goldIcon = Sprite.from(miscSpritesheet.textures['GoldIcon'])
    this.addChild(this._goldIcon)

    this._balanceText = new BitmapText('0', {fontName: TIMER_FONT, align: 'right'})
    this._balanceText.anchor.set(0, 1)
    this.addChild(this._balanceText)

    this.onResize()

    this._gameRenderer.resizer.addResizeListener(this.onResize)
  }

  public setBalance(value: number): void {
    if (this._balance === value) return
    this._balance = value
    this._balanceText.text = value.toString()
  }

  public override destroy(): void {
    this._gameRenderer.resizer.removeResizeListener(this.onResize)
    super.destroy()
  }

  private readonly onResize = () => {
    this._bgSprite.width = this._gameRenderer.resizer.dvh(442 / 2)
    this._bgSprite.height = this._gameRenderer.resizer.dvh(118 / 2)

    this.x = this._gameRenderer.resizer.dvh(20)
    this.y = this._gameRenderer.resizer.dvh(30)

    this._goldIcon.x = this._gameRenderer.resizer.dvh(10)
    this._goldIcon.y = this._gameRenderer.resizer.dvh(8)
    this._goldIcon.width = this._gameRenderer.resizer.dvh(72 / 2)
    this._goldIcon.height = this._gameRenderer.resizer.dvh(72 / 2)

    this._balanceText.fontSize = this._gameRenderer.resizer.dvh(30)
    this._balanceText.x = this._bgSprite.width - this._balanceText.width - this._gameRenderer.resizer.dvh(20)
    this._balanceText.y = this._bgSprite.height - this._gameRenderer.resizer.dvh(22)
  }
}