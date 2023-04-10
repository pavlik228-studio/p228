import { FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../../../components/button/button'
import { Diamond } from '../../../../../../components/diamond/diamond'
import { GameText } from '../../../../../../components/game-text/game-text'
import classes from './hero-card.module.sass'

interface HeroCardProps {
  id: string
  img: string
  locked: boolean
  selected: boolean
  stats: [string, number][]
  onSelected: (heroId: string) => void
}
export const HeroCard: FC<HeroCardProps> = ({
  id,
  img,
  locked,
  selected,
  stats,
  onSelected,
}) => {
  const { t } = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  const onSelect = () => {
    if (!cardRef.current) return
    cardRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    if (locked) return
    onSelected(id)
  }

  const cardClassName = `${classes['root']} ${selected ? classes['selected'] : selected} ${locked ? classes['locked'] : ''}`

  return (
    <div className={cardClassName} ref={cardRef} onClick={onSelect}>
      <div className={classes['img']} style={{ backgroundImage: `url(${img})` }} />
      <GameText text={t(`heroes.${id}`)} className={classes['title']} />
      <div className={classes['stats']}>
        {stats.map(([name, value]) => (
          <div className={classes['stat']} key={name}>
            <div className={classes['name']}>{t(`stats.${name}`)}</div>
            <div className={classes['value']}>{value}</div>
          </div>
        ))}
      </div>
      {!locked ? null : (
        <Button className={classes['buy']}>
          <span>{t('buy')}</span>
          <Diamond className={classes['diamond']} size={'sm'} />
          <span className={classes['x']}>x</span>
          <span>322</span>
        </Button>
      )}
    </div>
  )
}