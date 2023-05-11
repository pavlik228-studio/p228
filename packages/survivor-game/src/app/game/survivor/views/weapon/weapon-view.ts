import { Interpolation, Transform2d } from '@p228/engine'
import { MathOps } from '@p228/math'
import { EntityView } from '@p228/renderer-2d'
import { SurvivorWorld, Weapon, WeaponId } from '@p228/survivor-simulation'
import { Assets, Sprite, Spritesheet } from 'pixi.js'
import { GameSceneAssets } from '../../../resource-manifest'
import { GameScene } from '../../game-scene'
import { PlayerGroup } from '../../layer-groups'

export class WeaponView extends EntityView<SurvivorWorld, GameScene> {
  public onCreate(world: SurvivorWorld): void {
    const spriteSheet = Assets.get(GameSceneAssets.Weapons) as Spritesheet
    let spriteTitle = WeaponId[Weapon.type[this.entityRef] as any]
    if (spriteTitle.startsWith('Weapon')) spriteTitle = 'DestructiveAssaultRiffle'
    const sprite = Sprite.from(spriteSheet.textures[spriteTitle])
    sprite.parentGroup = PlayerGroup
    sprite.scale.set(spriteSheet.resolution * 0.4)
    this.position.set(Transform2d.x[this.entityRef], -Transform2d.y[this.entityRef])
    this.addChild(sprite)
  }

  public onDestroy(world: SurvivorWorld): void {
  }

  public onUpdate(world: SurvivorWorld, dt: number): void {
    const interpolatedTransform = Interpolation.interpolateTransform2d(this.entityRef, Transform2d, world.interpolationFactor)
    this.position.copyFrom(interpolatedTransform)
    this.rotation = -interpolatedTransform.rotation

    if (this.rotation < -MathOps.PI_HALF || this.rotation > MathOps.PI_HALF) {
      this.scale.y = -1
    } else {
      this.scale.y = 1
    }
  }
}