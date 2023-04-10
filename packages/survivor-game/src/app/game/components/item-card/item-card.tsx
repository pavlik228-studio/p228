import { FC } from 'react'
import {
  ItemPopupKind,
  ItemPopupService,
  ItemType,
} from '../../ui/desktop/components/items/components/item-popup/item-popup.service'
import classes from './item-card.module.sass'

interface ItemCardProps {
  size?: 'sm' | 'md' | 'lg' | 'huge'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic'
  locked: boolean
  itemClass?: string
  inactive?: boolean
}
export const ItemCard: FC<ItemCardProps> = ({
  size,
  rarity,
  locked,
  itemClass,
  inactive,
}) => {
  const sizeClass = size ? classes[size] : classes['md']
  const rarityClass = classes[rarity]
  const lockedClass = locked ? classes['locked'] : ''
  const cardClass = `${classes['root']} ${sizeClass} ${rarityClass} ${lockedClass}`

  const onClick = () => {
    if (inactive) return
    if (locked) {
      console.log('locked')
      ItemPopupService.show(ItemPopupKind.UnlockSlot, ItemType.Item)
    } else {
      console.log('not locked')
      ItemPopupService.show(ItemPopupKind.Buy, ItemType.Item, itemClass)
    }
  }

  return (
    <div className={cardClass} onClick={onClick}>
      <div className={`${classes['item']} ${itemClass || ''}`} />
    </div>
  )
}