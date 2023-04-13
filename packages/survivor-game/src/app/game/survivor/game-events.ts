import { SurvivorWorld } from '@p228/survivor-simulation'
import { AnimatedSprite, Assets, Spritesheet } from 'pixi.js'
import {
  ExplosionEvent,
  ExplosionEventData,
} from '../../../../../survivor-simulation/src/lib/features/weapon/events/explosion'
import { GameSceneAssets } from '../resource-manifest'
import { GameViewport } from './game-viewport'

export class GameEvents {
  constructor(
    private readonly _world: SurvivorWorld,
    private readonly _viewport: GameViewport,
  ) {
    this._world.simulationEvents.Predicted.subscribe(ExplosionEvent, this.onExplosionEvent)
  }

  private onExplosionEvent = (tick: number, data: ExplosionEventData) => {
    const explosionSheet = Assets.get(GameSceneAssets.ExplosionFX) as Spritesheet
    const explosionFx = new AnimatedSprite(explosionSheet.animations['explosion'])
    explosionFx.scale.set(data.radius / 256 * 4)
    explosionFx.anchor.set(0.5)
    explosionFx.x = data.x
    explosionFx.y = -data.y
    explosionFx.animationSpeed = 0.8
    explosionFx.loop = false
    explosionFx.play()
    explosionFx.onComplete = () => explosionFx.destroy()
    this._viewport.addChild(explosionFx)
  }

  public destroy() {
    this._world.simulationEvents.Predicted.unsubscribe(ExplosionEvent, this.onExplosionEvent)
  }
}