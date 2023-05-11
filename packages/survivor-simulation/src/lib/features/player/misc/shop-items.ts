import { SimulationData } from '../../../simulation-data'
import { IInventoryItem } from '../../item/data/inventory-item'
import { ItemId } from '../../item/data/items-type'
import { WeaponId } from '../../weapon/data/weapon-type'

export enum ShopItemType {
  Weapon,
  Item,
}

export interface IShopItem extends IInventoryItem {
  type: ShopItemType
  itemId: ItemId | WeaponId
}

export interface IShopStateItem extends IShopItem {
  hasBought: boolean
}

export const getShopItems = () => {
  const shopWeapons = new Array<IShopItem>()

  for (const [ weaponType, weaponValues ] of Object.entries(SimulationData.weapons)) {
    for (let lvl = 0; lvl < 4; lvl++) {
      if (weaponValues.price[lvl] === 0) continue
      shopWeapons.push({
        price: weaponValues.price[lvl],
        level: lvl,
        type: ShopItemType.Weapon,
        itemId: Number(weaponType),
      })
    }
  }

  const shopItems = new Array<IShopItem>()

  for (const [ itemId, itemValues ] of Object.entries(SimulationData.items)) {
    shopItems.push({
      itemId: Number(itemId),
      type: ShopItemType.Item,
      level: itemValues.level,
      price: itemValues.price,
    })
  }

  return [ ...shopWeapons, ...shopItems ]
}