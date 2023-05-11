import { PlayerStatsSchema } from '../../player/components/player'
import { IInventoryItem } from './inventory-item'

export interface IItem extends IInventoryItem {
  stats: [ keyof PlayerStatsSchema, number ][]
}

export enum ItemId {
  MoneyBag,
  ChainReaction,
  GhoulElixir,
  Lamp,
  Bracer,
  Bomb,
  Item1,
  Item2,
  Item3,
  Item4,
  Item5,
  Item6,
}

export type ItemsConfig = { [key in ItemId]?: IItem }