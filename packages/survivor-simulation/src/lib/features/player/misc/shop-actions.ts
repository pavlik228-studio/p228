import { EntityRef } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { VECTOR2_BUFFER_1 } from '@p228/math'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Gameplay, GameplayStage } from '../../gameplay/gameplay.component'
import { ItemId } from '../../item/data/items-data'
import { spawnItem } from '../../item/misc/spawn-item'
import { WeaponData, WeaponType } from '../../weapon/data/weapon-type'
import { spawnWeapon } from '../../weapon/misc/spawn-weapon'
import { Player } from '../components/player'
import { PRNG } from './prng'
import { IShopItem, IShopStateItem, ShopItems, ShopItemType } from './shop-items'

const MAX_SHOP_ITEMS = 6

export class ShopActions {
  private static readonly _prng = new PRNG(0)

  public static getRerollPrice(playerEntityRef: EntityRef): number {
    const playerLuck = Player.luck[playerEntityRef]
    const rerolls = Player.shopRerolls[playerEntityRef]
    const rerollCost = Math.floor(100 * Math.pow(1.5, rerolls))

    return Math.floor(rerollCost * (1 - playerLuck))
  }

  public static calculateSellPrice(shopItem: IShopItem): number {
    const price = shopItem.price

    return Math.floor(price * 0.5)
  }

  public static getShopState(playerEntityRef: EntityRef): Array<IShopStateItem> {
    if (Gameplay.data.stage !== GameplayStage.Shop) throw new Error('Shop is not available')
    const playerLuck = Player.luck[playerEntityRef]
    this._prng.resetState(Player.shopState[playerEntityRef] * 4294967296)
    const itemsLevel = Gameplay.data.itemsLevel
    let tmpShopItems = new Array<IShopItem>()

    for (const item of ShopItems) {
      if (item.level > itemsLevel) {
        if (this._prng.nextFloat() <= playerLuck) {
          tmpShopItems.push(item)
        }
        continue
      }
      tmpShopItems.push(item)
    }

    tmpShopItems.filter((item) => {
      if (item.type !== ShopItemType.Weapon) return true

      return WeaponData[item.itemId as WeaponType].price[item.level] > 0
    })

    const shopBoughtSlots = Player.shopBoughtSlots.get(playerEntityRef)

    return this._prng
      .shuffle(tmpShopItems)
      .slice(0, MAX_SHOP_ITEMS)
      .map((item, index) => ({
        ...item,
        hasBought: shopBoughtSlots[index] === 1,
      }))
  }

  public static rerollShop(world: SurvivorWorld, playerEntityRef: EntityRef): void {
    if (Player.goldBalance[playerEntityRef] < this.getRerollPrice(playerEntityRef)) {
      throw new Error('Not enough gold')
    }

    Player.goldBalance[playerEntityRef] -= this.getRerollPrice(playerEntityRef)
    Player.shopRerolls[playerEntityRef] += 1
    Player.shopState[playerEntityRef] = world.random.nextFloat()
    const shopBoughtSlots = Player.shopBoughtSlots.get(playerEntityRef)
    for (let i = 0; i < shopBoughtSlots.length; i++) {
      shopBoughtSlots[i] = 0
    }
  }

  public static buyItem(world: SurvivorWorld, playerEntityRef: EntityRef, itemSlot: number): void {
    if (itemSlot < 0 || itemSlot >= MAX_SHOP_ITEMS) throw new Error('Invalid item slot')
    if (Player.shopSlots[playerEntityRef] <= itemSlot) throw new Error('Invalid item slot')

    const shopItems = this.getShopState(playerEntityRef)
    const item = shopItems[itemSlot]

    if (item === undefined) throw new Error('Invalid item slot, empty')
    if (item.hasBought) throw new Error('Item already bought')
    if (Player.goldBalance[playerEntityRef] < item.price) throw new Error('Not enough gold')

    Player.goldBalance[playerEntityRef] -= item.price

    const shopBoughtSlots = Player.shopBoughtSlots.get(playerEntityRef)
    shopBoughtSlots[itemSlot] = 1
    debugger

    if (item.type === ShopItemType.Item) {
      spawnItem(world, playerEntityRef, item.itemId as ItemId)
    } else if (item.type === ShopItemType.Weapon) {
      const weaponId = item.itemId as WeaponType
      VECTOR2_BUFFER_1.set(Transform2d.x[playerEntityRef], Transform2d.y[playerEntityRef])
      spawnWeapon(world.entityManager, playerEntityRef, weaponId, item.level, VECTOR2_BUFFER_1)
    } else {
      throw new Error('Invalid item type')
    }
  }

  public static sellItem(world: SurvivorWorld, playerEntityRef: EntityRef, itemRef: EntityRef): void {

  }
}