import { Filter } from '@p228/ecs'
import { EntityViewUpdater, IEntityViewConstructor } from '@p228/renderer-2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { GameScene } from './game-scene'
import { PlayerView } from './views/player/player-view'

export class SurvivorEntityViewUpdater extends EntityViewUpdater<SurvivorWorld, GameScene> {
  constructor(world: SurvivorWorld, gameScene: GameScene) {
    const entityViews = new Map<Filter, IEntityViewConstructor<SurvivorWorld, GameScene>>([
      [ world.filterPlayer, PlayerView ],
    ])
    super(gameScene, world, entityViews)
  }
}