import {
  IShopStateItem,
} from '../../../../../../../../survivor-simulation/src/lib/features/player/misc/shop-items'

export interface IViewItem extends IShopStateItem {
  locked?: boolean
  itemClass: string
  slot?: number
}