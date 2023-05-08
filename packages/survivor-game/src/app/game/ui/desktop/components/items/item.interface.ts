import { IShopStateItem } from '@p228/survivor-simulation'

export interface IViewItem extends IShopStateItem {
  locked?: boolean
  itemClass: string
  slot?: number
}