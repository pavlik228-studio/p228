import { Interpolation, Transform2d } from '@p228/engine'
import { VECTOR2_BUFFER_1 } from '@p228/math'
import { EntityView } from '@p228/renderer-2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { AnimatedSprite, Assets, Sprite, Spritesheet } from 'pixi.js'
import {
  Projectile,
  ProjectileType,
} from '../../../../../../../survivor-simulation/src/lib/features/projectile/components/projectile'
import { GameSceneAssets } from '../../../resource-manifest'
import { GameScene } from '../../game-scene'
import { FxGroup } from '../../layer-groups'
import { ProjectileColors } from './projectile-colors'

export class ProjectileView extends EntityView<SurvivorWorld, GameScene> {
  private _projectileType!: ProjectileType
  private _projectileSprite!: Sprite
  private _miscSpritesheet!: Spritesheet

  public onCreate(world: SurvivorWorld): void {
    this._projectileType = Projectile.type[this.entityRef]
    this._miscSpritesheet = Assets.get(GameSceneAssets.Misc)
    this._projectileSprite = Sprite.from(this._miscSpritesheet.textures[`Projectile${ProjectileType[this._projectileType]}`])
    this._projectileSprite.scale.set(0.5)

    this.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    this.angle = -Transform2d.rotation[this.entityRef]

    this.addChild(this._projectileSprite)
    this.spawnShootFx()
  }

  public onDestroy(world: SurvivorWorld): void {
    this.spawnDamageFx()
  }

  private spawnShootFx(): void {
    VECTOR2_BUFFER_1.set(40, 10).rotate(Transform2d.rotation[this.entityRef])
    const shootFx = new AnimatedSprite(this._miscSpritesheet.animations['ShootFX_'])
    shootFx.tint = ProjectileColors[this._projectileType]
    shootFx.scale.set(0.5)
    shootFx.parentGroup = FxGroup
    shootFx.position.set(Transform2d.x[this.entityRef] + VECTOR2_BUFFER_1.x, -(Transform2d.y[this.entityRef] + VECTOR2_BUFFER_1.y))
    shootFx.loop = false
    shootFx.animationSpeed = 1.2
    shootFx.onComplete = () => shootFx.destroy()
    shootFx.play()
    shootFx.rotation = -Transform2d.rotation[this.entityRef]
    this.ctx.viewport.addChild(shootFx)
  }

  private spawnDamageFx(): void {
    const damageFx = new AnimatedSprite(this._miscSpritesheet.animations['DamageFX'])
    damageFx.tint = ProjectileColors[this._projectileType]
    damageFx.scale.set(0.5)
    damageFx.parentGroup = FxGroup
    damageFx.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    damageFx.loop = false
    damageFx.animationSpeed = 0.5
    damageFx.onComplete = () => damageFx.destroy()
    damageFx.play()
    this.ctx.viewport.addChild(damageFx)
  }

  public onUpdate(world: SurvivorWorld, dt: number): void {
    const interpolatedTransform = Interpolation.interpolateTransform2d(this.entityRef, Transform2d, world.interpolationFactor)
    this.position.set(interpolatedTransform.x, interpolatedTransform.y)
    this.rotation = -interpolatedTransform.rotation
  }

}