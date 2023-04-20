import { AbstractSystem, EntityRef } from '@p228/ecs'
import { Rpc } from '@p228/engine'
import { SurvivorRpc, SurvivorWorld } from '@p228/survivor-simulation'
import { BuyShopItemData } from '../../../input/rpc-datas/buy-shop-item'
import { RerollShopData } from '../../../input/rpc-datas/reroll-shop'
import { Player } from '../components/player'
import { ShopActions } from '../misc/shop-actions'

const BUY_SHOP_ITEM_RPC = new Array<Rpc<BuyShopItemData>>()
const REROLL_SHOP_RPC = new Array<Rpc<RerollShopData>>()

export class PlayerShopSystem extends AbstractSystem<SurvivorWorld> {
  constructor(world: SurvivorWorld) {
    super(world)
  }

  public override update() {
    const playerEntities = this.world.filterPlayer.entities

    for (const playerEntityRef of playerEntities) {
      BUY_SHOP_ITEM_RPC.length = 0
      REROLL_SHOP_RPC.length = 0
      this.world.inputProvider.rpcHistory.getPlayerRPCByType(this.world.tick, Player.slot[playerEntityRef], SurvivorRpc.BuyShopItem, BUY_SHOP_ITEM_RPC)
      this.world.inputProvider.rpcHistory.getPlayerRPCByType(this.world.tick, Player.slot[playerEntityRef], SurvivorRpc.RerollShop, REROLL_SHOP_RPC)
      this.buyShopItem(playerEntityRef, BUY_SHOP_ITEM_RPC)
      this.rerollShop(playerEntityRef, REROLL_SHOP_RPC)
    }
  }

  private buyShopItem(playerEntityRef: EntityRef, rpc: Array<Rpc<BuyShopItemData>>) {
    for (const rpcItem of rpc) {
      ShopActions.buyItem(this.world, playerEntityRef, rpcItem.data.shopSlot)
    }
  }

  private rerollShop(playerEntityRef: EntityRef, rpc: Array<Rpc<RerollShopData>>) {
    for (const rpcItem of rpc) {
      ShopActions.rerollShop(this.world, playerEntityRef)
    }
  }
}