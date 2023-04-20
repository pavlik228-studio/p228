import { PlayerStatsSchema } from '../../player/components/player'
import { IInventoryItem } from './inventory-item'

interface IItem extends IInventoryItem {
  stats: [ keyof PlayerStatsSchema, number ][]
}

export enum ItemId {
  MoneyBag,
  ChainReaction,
  GhoulElixir,
  Lamp,
  Bracer,
  Bomb,
}

export const ItemsData: { [key in ItemId]: IItem } = {
  [ItemId.MoneyBag]: { price: 100, level: 0, stats: [ [ 'harvesting', 0.3 ], ], },
  [ItemId.ChainReaction]: { price: 100, level: 0, stats: [], },
  [ItemId.GhoulElixir]: { price: 100, level: 0, stats: [ [ 'lifeSteal', 0.02 ], [ 'harvesting', -0.2 ] ], },
  [ItemId.Lamp]: { price: 100, level: 1, stats: [ [ 'range', 0.2 ], [ 'attackSpeed', 0.1 ], [ 'lifeSteal', -0.02 ] ], },
  [ItemId.Bracer]: { price: 100, level: 0, stats: [], },
  [ItemId.Bomb]: { price: 100, level: 0, stats: [] },
}