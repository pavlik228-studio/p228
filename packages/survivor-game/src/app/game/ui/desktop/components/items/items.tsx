import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { Button } from '../../../../../components/button/button'
import { Diamond } from '../../../../../components/diamond/diamond'
import { ItemCard } from '../../../../components/item-card/item-card'
import { ItemPopup } from './components/item-popup/item-popup'
import { ItemPopupData, ItemPopupService } from './components/item-popup/item-popup.service'
import { ItemsPlate } from './components/items-plate/items-plate'
import classes from './items.module.sass'

interface ItemsProps {
  onNext: () => void
  onBack: () => void
}

export const Items: FC<ItemsProps> = ({onNext, onBack}) => {
  const {t} = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)
  const [ popupData, setPopupData ] = useState<ItemPopupData | undefined>(undefined)

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
              popupData ? (<ItemPopup data={popupData} />) : (
                <div className={classes['main']}>
                  <div className={classes['header']}>
                    <Button onClick={onBack}><span>{t('back')}</span></Button>
                    <Button className={classes['title-button']}
                            interactive={false}><span>{t('weaponsAndItems')}</span></Button>
                    <Button onClick={onNext}><span>{t('next')}</span></Button>
                  </div>
                  <div className={classes['content']}>
                    <ItemsPlate title={t('Weapons')}>
                      <div className={classes['weapon-list']}>
                        <ItemCard locked={false} rarity={'epic'} size={'md'} itemClass={'dagger'}/>
                        <ItemCard locked={false} rarity={'common'} size={'md'} itemClass={'destructive-assault-riffle'}/>
                        <ItemCard locked={false} rarity={'common'} size={'md'} itemClass={'destructive-blaster'}/>
                        <ItemCard locked={true} rarity={'common'} size={'md'}/>
                        <ItemCard locked={true} rarity={'common'} size={'md'}/>
                        <ItemCard locked={true} rarity={'common'} size={'md'}/>
                      </div>
                    </ItemsPlate>
                    <ItemsPlate title={t('Items')}>
                      <div className={classes['item-list']}>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'ethernal-gun'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'ethernal-riffle'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'ethernal-rpg'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'force-assault-riffle'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'force-blaster'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'force-gun'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'destructive-gun'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'destructive-riffle'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'} itemClass={'ethernal-blaster'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'}/>
                        <ItemCard locked={false} rarity={'common'} size={'sm'}/>
                      </div>
                    </ItemsPlate>
                    <ItemsPlate className={classes['shop']} title={t('Shop')}>
                      <>
                        <div className={classes['shop-list']}>
                          <ItemCard locked={false} rarity={'common'} size={'lg'} itemClass={'force-riffle'}/>
                          <ItemCard locked={false} rarity={'uncommon'} size={'lg'} itemClass={'sword'}/>
                          <ItemCard locked={false} rarity={'rare'} size={'lg'} itemClass={'toxic-blaster'}/>
                          <ItemCard locked={false} rarity={'epic'} size={'lg'} itemClass={'toxic-gun'}/>
                          <ItemCard locked={true} rarity={'common'} size={'lg'} itemClass={'toxic-riffle'}/>
                          <ItemCard locked={true} rarity={'common'} size={'lg'} itemClass={'toxic-rpg'}/>
                        </div>
                        <Button className={classes['shop-button']}>
                          <span>{t('reroll')}</span>
                          <Diamond size={'md'}/>
                          <span className={classes['x']}>x</span>
                          <span>100</span>
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