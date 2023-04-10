import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../../../../components/button/button'
import { GameText } from '../../../../../../../components/game-text/game-text'
import { GoldBalance } from '../../../../../../../components/gold-balance/gold-balance'
import { ItemCard } from '../../../../../../components/item-card/item-card'
import classes from './item-popup.module.sass'
import { ItemPopupData, ItemPopupService, ItemType } from './item-popup.service'

interface ItemPopupProps {
  data: ItemPopupData | undefined
}
export const ItemPopup: FC<ItemPopupProps> = ({
  data
}) => {
  const { t } = useTranslation()

  const onBack = () => {
    ItemPopupService.hide()
  }

  return !data ? null : (
    <div className={`${classes['root']}`}>
      <div className={classes['header']}>
        <Button onClick={onBack}><span>{t('back')}</span></Button>
        <GoldBalance balance={100} />
      </div>
      <div className={classes['content']}>
        <GameText text={t(ItemType[data.type])} className={classes['subtitle']} />
        <div className={classes['item']}>
          <div className={classes['item__main']}>
            <GameText text={t(data.itemId || 'newSlot')} className={classes['title']} />
            <ItemCard rarity={'common'} locked={false} size={'huge'} itemClass={data.itemId} inactive={true} />
          </div>
          <div className={classes['item__info']}>
            <GameText text={t('statsTitle')} className={classes['title']} />
            <div className={classes['item__stats']}>
              <div className={classes['item__stat']}>
                <div className={classes['stat__title']}>{t(`stats.Damage`)}</div>
                <div className={classes['stat__value']}>10</div>
              </div>
              <div className={classes['item__stat']}>
                <div className={classes['stat__title']}>{t(`stats.AttackSpeed`)}</div>
                <div className={classes['stat__value']}>1.2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}