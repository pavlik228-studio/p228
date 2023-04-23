import { Assets, Container, TilingSprite } from 'pixi.js'
import { WORLD_BOUNDS_X, WORLD_BOUNDS_Y } from '../../../../../../survivor-simulation/src/lib/constants'
import { GameSceneAssets } from '../../resource-manifest'

export class MapGrass extends Container {
  constructor() {
    super()
    // const tiledSprite = new TilingSprite(Assets.get(GameSceneAssets.undergroundWorld))
    const tiledSprite = new TilingSprite(Assets.get(GameSceneAssets.grassWorld))
    tiledSprite.tint = '#ababab'
    tiledSprite.width = WORLD_BOUNDS_X * 2
    tiledSprite.height = WORLD_BOUNDS_Y * 2
    tiledSprite.tileScale.set(0.5)
    tiledSprite.x = -WORLD_BOUNDS_X
    tiledSprite.y = -WORLD_BOUNDS_Y
    this.addChild(tiledSprite)
  }
}