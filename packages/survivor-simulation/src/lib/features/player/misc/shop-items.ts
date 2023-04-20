import { IInventoryItem } from '../../item/data/inventory-item'
import { ItemId, ItemsData } from '../../item/data/items-data'
import { WeaponData, WeaponType } from '../../weapon/data/weapon-type'

export enum ShopItemType {
  Weapon,
  Item,
}

export interface IShopItem extends IInventoryItem {
  type: ShopItemType
  itemId: ItemId | WeaponType
}

export interface IShopStateItem extends IShopItem {
  hasBought: boolean
}

const weaponShopItems = new Array<IShopItem>()

for (const [ weaponType, weaponValues ] of Object.entries(WeaponData)) {
  for (let lvl = 0; lvl < 4; lvl++) {
    if (weaponValues.price[lvl] === 0) continue
    weaponShopItems.push({
      price: weaponValues.price[lvl],
      level: lvl,
      type: ShopItemType.Weapon,
      itemId: Number(weaponType),
    })
  }
}

const shopItems = new Array<IShopItem>()

for (const [ itemId, itemValues ] of Object.entries(ItemsData)) {
  shopItems.push({
    itemId: Number(itemId),
    type: ShopItemType.Item,
    level: itemValues.level,
    price: itemValues.price,
  })
}

export const ShopItems = [
  ...weaponShopItems,
  ...shopItems,
]