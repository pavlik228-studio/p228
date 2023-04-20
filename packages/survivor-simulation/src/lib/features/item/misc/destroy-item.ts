import { EntityRef } from '@p228/ecs'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Player } from '../../player/components/player'
import { Item } from '../components/item'
import { ItemId, ItemsData } from '../data/items-data'

export function destroyItem(world: SurvivorWorld, itemRef: EntityRef) {
  if (!world.entityManager.hasComponent(itemRef, Item)) throw new Error('Item is not found')

  const itemId = Item.id[itemRef] as ItemId
  const itemData = ItemsData[itemId]
  const ownerRef = Item.ownerRef[itemRef]

  for (const [ stat, value ] of itemData.stats) {
    Player[stat][ownerRef] -= value
  }

  world.entityManager.destroyEntity(itemRef)
}