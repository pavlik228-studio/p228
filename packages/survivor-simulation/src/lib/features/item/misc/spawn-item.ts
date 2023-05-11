import { EntityRef } from '@p228/ecs'
import { SimulationData, SurvivorWorld } from '@p228/survivor-simulation'
import { Player } from '../../player/components/player'
import { Item } from '../components/item'
import { ItemId } from '../data/items-type'

export function spawnItem(world: SurvivorWorld, ownerRef: EntityRef, itemId: ItemId) {
  const itemRef = world.entityManager.createEntity()

  world.entityManager.addComponent(itemRef, Item)

  Item.id[itemRef] = itemId
  Item.ownerRef[itemRef] = ownerRef

  const itemData = SimulationData.items[itemId]!

  for (const [ stat, value ] of itemData.stats) {
    Player[stat][ownerRef] += value
  }
}