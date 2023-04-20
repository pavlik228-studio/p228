import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { ItemId } from '../../../../../../../../survivor-simulation/src/lib/features/item/data/items-data'
import {
  ShopItemType,
} from '../../../../../../../../survivor-simulation/src/lib/features/player/misc/shop-items'
import { WeaponType } from '../../../../../../../../survivor-simulation/src/lib/features/weapon/data/weapon-type'
import { Button } from '../../../../../components/button/button'
import { GoldBalance } from '../../../../../components/gold-balance/gold-balance'
import { Gold } from '../../../../../components/gold/gold'
import { rerollShop } from '../../../../../store/features/game/game-slice'
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks'
import { ItemCard } from '../../../../components/item-card/item-card'
import { ItemPopup } from './components/item-popup/item-popup'
import { ItemPopupData, ItemPopupService } from './components/item-popup/item-popup.service'
import { ItemsPlate } from './components/items-plate/items-plate'
import { IViewItem } from './item.interface'
import classes from './items.module.sass'

interface ItemsProps {
  onNext: () => void
  onBack: () => void
}

export const Items: FC<ItemsProps> = ({onNext}) => {
  const {t} = useTranslation()
  const {shopState, rerollPrice, weapons, items, shopSlotsCount} = useAppSelector((state) => state.game)
  const dispatch = useAppDispatch()
  const rootRef = useRef<HTMLDivElement>(null)
  const [ popupData, setPopupData ] = useState<ItemPopupData | undefined>(undefined)

  const viewShopItems: IViewItem[] = shopState.map((item, idx) => {
    const locked = idx >= shopSlotsCount

    return {
      ...item,
      locked,
      slot: idx,
      itemClass: item.type === ShopItemType.Weapon ? WeaponType[item.itemId] : `item item-${ItemId[item.itemId]}`,
    }
  })

  const viewWeapons: Array<IViewItem | undefined> = weapons.map((weapon) => {
    return {
      ...weapon,
      hasBought: true,
      itemClass: WeaponType[weapon.itemId],
    }
  })

  for (let i = viewWeapons.length; i < 6; i++) viewWeapons.push(undefined)

  const viewItems: Array<IViewItem | undefined> = items.map((item) => {
    return {
      ...item,
      hasBought: true,
      itemClass: `item item-${ItemId[item.itemId]}`,
    }
  })

  for (let i = viewItems.length; i < 12; i++) viewItems.push(undefined)

  const onReroll = () => {
    dispatch(rerollShop())
  }

  useEffect(() => {
    const subscription = ItemPopupService.subscribe(setPopupData)

    return () => {
      subscription.dispose()
    }
  }, [])

  return (
    <div className={classes['window']}>
      <SwitchTransition mode={'out-in'}>
        <CSSTransition
          key={popupData ? 'popup' : 'items'}
          timeout={250}
          nodeRef={rootRef}
          classNames={{
            enter: 'animate__animated animate__zoomIn',
            enterActive: 'animate__animated animate__zoomIn',
            exit: 'animate__animated animate__fadeOut',
            exitActive: 'animate__animated animate__fadeOut',
          }}
          unmountOnExit
        >
          <div className={classes['root']} ref={rootRef}>
            {
              popupData ? (<ItemPopup data={popupData}/>) : (
                <div className={classes['main']}>
                  <div className={classes['header']}>
                    {/*<Button onClick={onBack}><span>{t('back')}</span></Button>*/}
                    <GoldBalance />
                    <Button className={classes['title-button']}
                            interactive={false}><span>{t('weaponsAndItems')}</span></Button>
                    <Button onClick={onNext}><span>{t('next')}</span></Button>
                  </div>
                  <div className={classes['content']}>
                    <ItemsPlate title={t('Weapons')}>
                      <div className={classes['weapon-list']}>
                        {viewWeapons.map((item, idx) => (
                          <ItemCard
                            owned
                            key={idx}
                            size={'md'}
                            item={item}
                            forceLocked={idx >= 4}
                          />
                        ))}
                      </div>
                    </ItemsPlate>
                    <ItemsPlate title={t('Items')}>
                      <div className={classes['item-list']}>
                        {viewItems.map((item, idx) => (
                          <ItemCard
                            owned
                            key={idx}
                            size={'sm'}
                            item={item}
                          />
                        ))}
                      </div>
                    </ItemsPlate>
                    <ItemsPlate className={classes['shop']} title={t('Shop')}>
                      <>
                        <div className={classes['shop-list']}>
                          {viewShopItems.map((item, idx) => (
                            <ItemCard
                              size={'lg'}
                              key={idx}
                              item={item.hasBought ? undefined : item}
                              showPrice
                            />
                          ))}
                        </div>
                        <Button className={classes['shop-button']} onClick={onReroll}>
                          <span>{t('rerollShop')}</span>
                          <Gold size={'md'}/>
                          <span className={classes['x']}>x</span>
                          <span>{rerollPrice}</span>
                        </Button>
                      </>
                    </ItemsPlate>
                  </div>
                </div>
              )
            }
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}