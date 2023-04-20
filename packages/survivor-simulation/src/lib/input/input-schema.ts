import { BuyShopItemData } from './rpc-datas/buy-shop-item'
import { MoveData } from './rpc-datas/move'
import { PlayerJoinedData } from './rpc-datas/player-joined'
import { RerollShopData } from './rpc-datas/reroll-shop'
import { SurvivorRpc } from './survivor-rpc'

export const SurvivorInputSchema = {
  [SurvivorRpc.PlayerJoined]: new PlayerJoinedData(0),
  [SurvivorRpc.Move]: new MoveData(0, 0),
  [SurvivorRpc.BuyShopItem]: new BuyShopItemData(0),
  [SurvivorRpc.RerollShop]: new RerollShopData(),
}