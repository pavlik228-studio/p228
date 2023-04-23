import { AbstractSystem } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { Vector2, VECTOR2_BUFFER_1, VECTOR2_BUFFER_2, VECTOR2_BUFFER_3 } from '@p228/math'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Player } from '../../player/components/player'
import { Gold } from '../components/gold'
import { findGoldInRadius } from '../misc/find-gold-in-radius'

const BASE_RADIUS = 120
const GOLD_COLLECTION_SPEED = 0.08
const GOLD_COLLECTION_RADIUS_SQUARED = Math.pow(20, 2)

export class GoldSystem extends AbstractSystem<SurvivorWorld> {
  public override update(): void {
    this.collectGold()
    this.collectingGold()
  }

  private collectGold(): void {
    for (const playerEntityRef of this.world.filterPlayer) {
      const radius = BASE_RADIUS + Player.harvesting[playerEntityRef] * 10
      const playerPosition = VECTOR2_BUFFER_1.set(Transform2d.x[playerEntityRef], Transform2d.y[playerEntityRef])
      const goldInRadius = findGoldInRadius(this.world, radius, playerPosition)

      for (const goldCollider of goldInRadius) {
        const goldEntityRef = this.world.colliderEntityRegistry.get(goldCollider.handle)
        if (goldEntityRef === undefined) throw new Error('goldEntityRef is undefined')

        Gold.collectedByRef[goldEntityRef] = playerEntityRef
        Gold.speed[goldEntityRef] = 1

        this.world.destroyCollider(goldCollider.handle)
      }
    }
  }

  private collectingGold(): void {
    for (const goldEntityRef of this.world.filterGold) {
      if (Gold.collectedByRef[goldEntityRef] === -1) continue
      const playerEntityRef = Gold.collectedByRef[goldEntityRef]
      const playerPosition = VECTOR2_BUFFER_1.set(Transform2d.x[playerEntityRef], Transform2d.y[playerEntityRef])
      const goldPosition = VECTOR2_BUFFER_2.set(Transform2d.x[goldEntityRef], Transform2d.y[goldEntityRef])
      const goldMovement = VECTOR2_BUFFER_3.from(playerPosition).sub(goldPosition).normalize().scale(this.calculateGoldSpeed(Gold.speed[goldEntityRef]))
      goldPosition.add(goldMovement)

      Transform2d.x[goldEntityRef] = goldPosition.x
      Transform2d.y[goldEntityRef] = goldPosition.y
      Gold.speed[goldEntityRef] = Math.min(255, Gold.speed[goldEntityRef] + 1)

      if (Vector2.DistanceSquared(goldPosition, playerPosition) < GOLD_COLLECTION_RADIUS_SQUARED) {
        Player.goldBalance[playerEntityRef] += Gold.gold[goldEntityRef]
        // Player.xp[playerEntityRef] += Gold.xp[goldEntityRef]
        this.world.entityManager.destroyEntity(goldEntityRef)
      }

    }
  }

  /**
   * Calculates the speed of the gold.
   * @param speed 1 - 255
   * @private
   */
  private calculateGoldSpeed(speed: number): number {
    return this.world.config.deltaTime * GOLD_COLLECTION_SPEED * Math.pow(speed, 2) / 255
  }
}