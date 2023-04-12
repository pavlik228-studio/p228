import { Assets, Container, TilingSprite } from 'pixi.js'
import { GameSceneAssets } from '../../resource-manifest'

export class Map1 extends Container {
  constructor() {
    super()
    // const tiledSprite = new TilingSprite(Texture.from('/game/ground.png'))
    // const tiledSprite = new TilingSprite(Texture.from('/game/f_6216432ba4464f37.jpg'))
    const tiledSprite = new TilingSprite(Assets.get(GameSceneAssets.grassWorld))
    tiledSprite.width = 6000
    tiledSprite.height = 6000
    tiledSprite.tileScale.set(0.5)
    tiledSprite.x = -3000
    tiledSprite.y = -3000
    this.addChild(tiledSprite)
  }
}