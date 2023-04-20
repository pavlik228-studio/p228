import { Interpolation, Transform2d } from '@p228/engine'
import { MathOps } from '@p228/math'
import { EntityView } from '@p228/renderer-2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { AnimatedSprite, Assets, Point, Sprite, Spritesheet } from 'pixi.js'
import { Player } from '../../../../../../../survivor-simulation/src/lib/features/player/components/player'
import { PlayerCharacter } from '../../../../../../../survivor-simulation/src/lib/features/player/data/player-character'
import { GameSceneAssets } from '../../../resource-manifest'
import { GameScene } from '../../game-scene'
import { PlayerGroup, ShadowGroup } from '../../layer-groups'
import { PlayerAnimator } from './player-animator'

const COLLIDER_OFFSET = new Point(0, 54)

export class PlayerView extends EntityView<SurvivorWorld, GameScene> {
  private _heroShadow!: Sprite
  private _heroSpritesheet!: Spritesheet
  private _heroSprite!: AnimatedSprite
  private _animator!: PlayerAnimator
  private _scale = 0

  public onCreate(world: SurvivorWorld): void {
    if (this.ctx.playerSlot === Player.slot[this.entityRef]) {
      this.ctx.viewport.follow(this)
    }
    const miscSpritesheet = Assets.get(GameSceneAssets.Misc) as Spritesheet
    this._heroShadow = Sprite.from(miscSpritesheet.textures['HeroShadow'])
    this._heroShadow.parentGroup = ShadowGroup
    this._heroShadow.scale.set(0.5)
    this._heroShadow.position.copyFrom(COLLIDER_OFFSET)
    this.addChild(this._heroShadow)

    const playerCharacter = Player.character[this.entityRef] as PlayerCharacter
    this._heroSpritesheet = Assets.get(GameSceneAssets[PlayerCharacter[playerCharacter] as keyof typeof GameSceneAssets]) as Spritesheet
    this._heroSprite = new AnimatedSprite(this._heroSpritesheet.animations['Idle'])
    this._heroSprite.parentGroup = PlayerGroup
    this._scale = this._heroSpritesheet.resolution * 0.5
    this._heroSprite.scale.set(this._scale)
    this._heroSprite.animationSpeed = 0.5
    this._heroSprite.play()
    this._heroSprite.position.copyFrom(COLLIDER_OFFSET)
    this.addChild(this._heroSprite)
    this.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    this._animator = new PlayerAnimator(this._heroSprite, this._heroSpritesheet, {
      health: 100,
      isDead: false,
      lastDamageAt: undefined,
      speed: Player.speed[this.entityRef],
    })
  }

  public onDestroy(world: SurvivorWorld): void {
    if (this.ctx.playerSlot === Player.slot[this.entityRef]) {
      this.ctx.viewport.plugins.remove('follow')
    }

    const playerDieAnimation = new AnimatedSprite(this._heroSpritesheet.animations['Dying'])
    playerDieAnimation.parentGroup = PlayerGroup
    playerDieAnimation.scale.set(this._scale)
    playerDieAnimation.animationSpeed = this._heroSprite.animationSpeed
    playerDieAnimation.loop = false
    playerDieAnimation.play()
    playerDieAnimation.position.copyFrom(this.position)
    this.ctx.viewport.addChild(playerDieAnimation)
  }

  public onUpdate(world: SurvivorWorld, dt: number): void {
    const interpolatedTransform = Interpolation.interpolateTransform2d(this.entityRef, Transform2d, world.interpolationFactor)
    this.position.set(interpolatedTransform.x, interpolatedTransform.y)
    const animatorCtx = this._animator.context
    animatorCtx.health = 100
    animatorCtx.isDead = false
    animatorCtx.lastDamageAt = undefined
    animatorCtx.speed = Player.speed[this.entityRef]
    this._animator.update()

    const playerDirection = Player.direction[this.entityRef]
    const direction = playerDirection < 0 ? MathOps.PI_2 + playerDirection : playerDirection

    if (direction < MathOps.PI_HALF || direction > MathOps.PI_3_4) {
      this._heroSprite.scale.x = this._scale
    } else if (direction > MathOps.PI_HALF || direction < MathOps.PI_3_4) {
      this._heroSprite.scale.x = -this._scale
    }
  }
}