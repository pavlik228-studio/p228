import { ItemId, ShopActions, ShopItemType, WeaponType } from '@p228/survivor-simulation'
import { TFunction } from 'i18next'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../../../../components/button/button'
import { Diamond } from '../../../../../../../components/diamond/diamond'
import { GameText } from '../../../../../../../components/game-text/game-text'
import { GoldBalance } from '../../../../../../../components/gold-balance/gold-balance'
import { Gold } from '../../../../../../../components/gold/gold'
import { buyShopItem } from '../../../../../../../store/features/game/game-slice'
import { useAppDispatch } from '../../../../../../../store/hooks'
import { ItemCard } from '../../../../../../components/item-card/item-card'
import { extractWeaponStats } from '../../../../../../misc/extract-weapon-stats'
import { IViewItem } from '../../item.interface'
import classes from './item-popup.module.sass'
import { ItemPopupData, ItemPopupKind, ItemPopupService } from './item-popup.service'

interface ItemPopupProps {
  data: ItemPopupData | undefined
}

export const ItemPopup: FC<ItemPopupProps> = ({
  data,
}) => {
  const {t} = useTranslation()
  const dispatch = useAppDispatch()

  const onBack = () => {
    ItemPopupService.hide()
  }

  const onBuy = () => {
    if (!data?.item || data.item.slot === undefined) throw new Error('Item slot is undefined')

    dispatch(buyShopItem({ itemSlot: data.item.slot }))
    ItemPopupService.hide()
  }

  const popupTypeTitle = data?.item ? ShopItemType[data.item.type] : 'slot'

  return !data ? null : (
    <div className={`${classes['root']}`}>
      <div className={classes['header']}>
        <Button onClick={onBack}><span>{t('back')}</span></Button>
        <GoldBalance/>
      </div>
      <div className={classes['content']}>
        <GameText text={t(`itemPopupTypes.${popupTypeTitle}`)} className={classes['subtitle']}/>
        <div className={classes['item']}>
          <div className={classes['item__main']}>
            <GameText text={t(data.item ? getItemTitle(data.item) : 'itemPopupTypes.newSlot')}
                      className={classes['title']}/>
            <ItemCard item={data.item} forceLocked={!data.item} size={'huge'} inactive={true}/>
          </div>
          <div className={classes['item__info']}>
            {data.kind === ItemPopupKind.UnlockSlot ? (
              <div className={classes['infoText']}>
                {t('itemPopupTypes.unlockSlotInfo')}
              </div>
            ) : (
              <>
                <GameText text={t('stats.statsTitle')} className={classes['title']}/>
                <div className={classes['item__stats']}>
                  {getItemStats(t, data.item).map(([ title, value ], idx) => (
                    <div className={classes['item__stat']} key={idx}>
                      <div className={classes['stat__title']}>{t(title)}</div>
                      <div className={classes['stat__value']}>{value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.kind === ItemPopupKind.Buy ? (
              <Button className={classes['buy']} onClick={onBuy}>
                <Gold/>
                <span className={classes['x']}>x</span>
                <span className={classes['price']}>{data.item!.price}</span>
              </Button>
            ) : data.kind === ItemPopupKind.UnlockSlot ? (
              <Button className={classes['buy']}>
                <Diamond />
                <span className={classes['x']}>x</span>
                <span className={classes['price']}>{300}</span>
              </Button>
            ) : data.kind === ItemPopupKind.Sell ? (
              <Button className={classes['buy']}>
                <span className={classes['x']}>Sell</span>
                <Gold/>
                <span className={classes['x']}>x</span>
                <span className={classes['price']}>{ShopActions.calculateSellPrice(data.item!)}</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const getItemStats = (t: TFunction, item?: IViewItem) => {
  if (!item) return []
  return item.type === ShopItemType.Item
    ? extractItemStats(item.itemId as ItemId)
    : extractWeaponStats(item.itemId as WeaponType, item.level, t)
}

const extractItemStats = (itemId: ItemId): [ string, string ][] => {
  return []
}

const getItemTitle = (item: IViewItem) => {
  return item.type === ShopItemType.Item
    ? ItemId[item.itemId]
    : `weapons.${WeaponType[item.itemId]}`
}