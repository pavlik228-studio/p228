import { FC, MouseEvent } from 'react'
import { useDispatch } from 'react-redux'
import { buyShopItem } from '../../../store/features/game/game-slice'
import {
  ItemPopupKind,
  ItemPopupService,
} from '../../ui/desktop/components/items/components/item-popup/item-popup.service'
import { IViewItem } from '../../ui/desktop/components/items/item.interface'
import { PriceBadge } from '../price-badge/price-badge'
import classes from './item-card.module.sass'

interface ItemCardProps {
  size?: 'sm' | 'md' | 'lg' | 'huge'
  inactive?: boolean
  item?: IViewItem
  owned?: boolean
  showPrice?: boolean
  forceLocked?: boolean
}

export const ItemCard: FC<ItemCardProps> = ({
  owned,
  size,
  item,
  inactive,
  showPrice,
  forceLocked,
}) => {
  const dispatch = useDispatch()
  const sizeClass = size ? classes[size] : classes['md']
  const rarityClass = classes[lvlToRarity(item?.level)]

  const lockedClass = item?.locked || forceLocked ? classes['locked'] : ''
  const cardClass = `${classes['root']} ${sizeClass} ${rarityClass} ${lockedClass}`

  const onClick = () => {
    if (inactive) return

    if (owned) {
      ItemPopupService.show(item === undefined ? ItemPopupKind.UnlockSlot : ItemPopupKind.Sell, item)
    } else if (item?.locked) {
      ItemPopupService.show(ItemPopupKind.UnlockSlot, undefined)
    } else if (item) {
      ItemPopupService.show(ItemPopupKind.Buy, item)
    }
  }

  const instantBuy = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (inactive) return
    if (item?.slot === undefined) throw new Error('Item slot is undefined')

    dispatch(buyShopItem({ itemSlot: item.slot }))
  }

  return (
    <div className={cardClass} onClick={onClick}>
      <div className={`${classes['item']} ${item?.itemClass === undefined ? '' : item.itemClass}`}/>
      {showPrice && item?.price && !item.locked ? <PriceBadge price={item.price} className={classes['price']} onClick={instantBuy} /> : null}
    </div>
  )
}

const lvlToRarity = (lvl?: number) => {
  return lvl === 0 ? 'common' : lvl === 1 ? 'uncommon' : lvl === 2 ? 'rare' : lvl === 3 ? 'epic' : 'common'
}