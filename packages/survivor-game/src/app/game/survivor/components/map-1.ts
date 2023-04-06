import { Container, Texture, TilingSprite } from 'pixi.js'

export class Map1 extends Container {
  constructor() {
    super()
    const tiledSprite = new TilingSprite(Texture.from('/game/ground.png'))
    tiledSprite.width = 6000
    tiledSprite.height = 6000
    tiledSprite.tileScale.set(0.5, 0.5)
    tiledSprite.x = -3000
    tiledSprite.y = -3000
    this.addChild(tiledSprite)
  }
}