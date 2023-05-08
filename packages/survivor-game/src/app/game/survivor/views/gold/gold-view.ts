import { Interpolation, Transform2d } from '@p228/engine'
import { EntityView } from '@p228/renderer-2d'
import { Gold, SurvivorWorld } from '@p228/survivor-simulation'
import { AnimatedSprite, Assets, Sprite, Spritesheet } from 'pixi.js'
import { GameSceneAssets } from '../../../resource-manifest'
import { GameScene } from '../../game-scene'
import { FxGroup, GoldGroup } from '../../layer-groups'

const GOLD_SPRITES = [ '1', '2', '3', '4', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15' ]

export class GoldView extends EntityView<SurvivorWorld, GameScene> {
  private _miscSpritesheet!: Spritesheet
  private _goldSprite!: Sprite
  private _timer = 0

  public onCreate(world: SurvivorWorld): void {
    this._miscSpritesheet = Assets.get(GameSceneAssets.Misc) as Spritesheet
    const spriteId = GOLD_SPRITES[this.entityRef % GOLD_SPRITES.length]
    this._goldSprite = Sprite.from(this._miscSpritesheet.textures[spriteId])
    this._goldSprite.scale.set(0.5)
    this._goldSprite.parentGroup = GoldGroup

    this.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    this.rotation = Math.random() * Math.PI * 2

    this.addChild(this._goldSprite)
    this.spawnGoldFx(false)
  }

  public onDestroy(world: SurvivorWorld): void {
    if (Gold.collectedByRef[this.entityRef] === -1) return
    this.spawnGoldFx(true)
  }

  private spawnGoldFx(destroy: boolean): void {
    const goldCollectedFx = new AnimatedSprite(this._miscSpritesheet.animations['shine'])
    goldCollectedFx.scale.set(destroy ? 1.5 : 0.6)
    goldCollectedFx.parentGroup = FxGroup
    goldCollectedFx.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    goldCollectedFx.animationSpeed = 0.5
    goldCollectedFx.loop = false
    goldCollectedFx.play()
    goldCollectedFx.onComplete = () => goldCollectedFx.destroy()
    this.ctx.viewport.addChild(goldCollectedFx)
  }

  public onUpdate(world: SurvivorWorld, dt: number): void {
    this._timer += dt
    const interpolatedTransform = Interpolation.interpolateTransform2d(this.entityRef, Transform2d, world.interpolationFactor)
    this.position.set(interpolatedTransform.x, interpolatedTransform.y)

    if (this._timer > 5000) {
      this._timer = 0
      this.spawnGoldFx(false)
    }
  }

}