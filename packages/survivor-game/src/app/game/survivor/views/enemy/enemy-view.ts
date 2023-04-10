import { Interpolation, Transform2d } from '@p228/engine'
import { MathOps } from '@p228/math'
import { EntityView } from '@p228/renderer-2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { AnimatedSprite, Assets, Sprite, Spritesheet } from 'pixi.js'
import { Enemy } from '../../../../../../../survivor-simulation/src/lib/features/enemy/components/enemy'
import {
  EnemyActiveAttack,
} from '../../../../../../../survivor-simulation/src/lib/features/enemy/components/enemy-active-attack'
import {
  EnemyData,
  EnemyType,
  IEnemyValues,
} from '../../../../../../../survivor-simulation/src/lib/features/enemy/data/enemy-type'
import { GameSceneAssets } from '../../../resource-manifest'
import { GameScene } from '../../game-scene'
import { EnemyGroup, ShadowGroup } from '../../layer-groups'

let direction = 0

export class EnemyView extends EntityView<SurvivorWorld, GameScene> {
  private _scale = 0
  private _enemyShadow!: Sprite
  private _enemySprite!: AnimatedSprite
  private _enemySpritesheet!: Spritesheet
  private _isAttacking = false
  private _enemyType!: EnemyType
  private _enemyValues!: IEnemyValues

  public onCreate(world: SurvivorWorld): void {
    this._enemyType = Enemy.type[this.entityRef]
    this._enemyValues = EnemyData.get(this._enemyType)!
    this._enemySpritesheet = getEnemySpriteSheet(this._enemyType)
    this._scale = this._enemySpritesheet.resolution * 0.5

    const misc = Assets.get(GameSceneAssets.Misc) as Spritesheet
    this._enemyShadow = Sprite.from(misc.textures['EnemyShadow'])
    this._enemyShadow.parentGroup = ShadowGroup
    this._enemyShadow.scale.set(misc.resolution * 0.5)
    this._enemyShadow.position.copyFrom(this._enemyValues.spritePivot)
    this.addChild(this._enemyShadow)

    this._enemySprite = new AnimatedSprite(this._enemySpritesheet.animations['Walk'])
    this._enemySprite.parentGroup = EnemyGroup
    this._enemySprite.scale.set(this._scale)
    this._enemySprite.position.x += this._enemyValues.spritePivot.x
    this._enemySprite.position.y += this._enemyValues.spritePivot.y
    this._enemySprite.animationSpeed = 0.5
    this._enemySprite.updateAnchor = true
    this._enemySprite.play()
    this._enemySprite.onLoop = this.onLoop

    this.position.set(Transform2d.x[this.entityRef], Transform2d.y[this.entityRef])

    this.addChild(this._enemySprite)
  }

  public onUpdate(world: SurvivorWorld, dt: number): void {
    this.position.copyFrom(Interpolation.interpolateTransform2d(this.entityRef, Transform2d, world.interpolationFactor))
    this._enemySprite.zOrder = this.position.y
    direction = Transform2d.rotation[this.entityRef]
    if (direction < 0) direction += MathOps.PI_2

    if (direction < MathOps.PI_HALF || direction > MathOps.PI_3_4) {
      this._enemySprite.scale.x = this._scale
    } else if (direction > MathOps.PI_HALF || direction < MathOps.PI_3_4) {
      this._enemySprite.scale.x = -this._scale
    }

    if (world.entityManager.hasComponent(this.entityRef, EnemyActiveAttack)) {
      if (this._isAttacking) return
      this._isAttacking = true
      this._enemySprite.textures = this._enemySpritesheet.animations['Hitting']
      this._enemySprite.play()
    } else {
      if (!this._isAttacking) return
      this._isAttacking = false
      this._enemySprite.textures = this._enemySpritesheet.animations['Walk']
      this._enemySprite.play()
    }
  }

  public onDestroy(world: SurvivorWorld): void {
  }

  private onLoop = () => {
    if (this._isAttacking && !this._enemyValues.loopAttack) {
      this._enemySprite.gotoAndStop(this._enemySprite.textures.length - 1)
    }
  }
}

function getEnemySpriteSheet(enemyType: EnemyType): Spritesheet {
  return Assets.get(GameSceneAssets[EnemyType[enemyType] as unknown as keyof typeof GameSceneAssets])
}