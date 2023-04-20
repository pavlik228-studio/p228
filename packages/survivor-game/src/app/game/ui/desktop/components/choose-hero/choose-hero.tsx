import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PlayerCharacter
} from '../../../../../../../../survivor-simulation/src/lib/features/player/data/player-character'
import { Button } from '../../../../../components/button/button'
import { initGameThunk } from '../../../../../store/features/game/thunks/init-game.thunk'
import { useAppDispatch } from '../../../../../store/hooks'
import classes from './choose-hero.module.sass'
import { HeroCard } from './components/hero-card'

const HEROES_MOCK = [
  { id: PlayerCharacter.Warrior, locked: false, img: '/game/heroes-preview/Warrior.png', stats: [['HP', 100], ['Armor', 20], ['Dodge', 0], ['Regeneration', 1], ['Damage', 4], ['Luck', 10], ['Range', 0]] as [string, number][] },
  { id: PlayerCharacter.Sergeant, locked: false, img: '/game/heroes-preview/Sergeant.png', stats: [['HP', 100], ['Armor', 20], ['Dodge', 0], ['Regeneration', 1], ['Damage', 4], ['Luck', 10], ['Range', 0]] as [string, number][] },
  { id: PlayerCharacter.Paladin, locked: true, img: '/game/heroes-preview/Paladin.png', stats: [['HP', 100], ['Armor', 20], ['Dodge', 0], ['Regeneration', 1], ['Damage', 4], ['Luck', 10], ['Range', 0]] as [string, number][] },
  // { id: 'Golem', locked: true, img: '/game/heroes-preview/Golem.png', stats: [['HP', 200], ['Armor', 50], ['Dodge', 0], ['Regeneration', 1], ['Damage', 4], ['Luck', 10], ['Range', 0]] as [string, number][] },
]

interface ChooseHeroProps {
  onNext: () => void
  onBack: () => void
}
export const ChooseHero: FC<ChooseHeroProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [ selectedHero, setSelectedHero ] = useState<PlayerCharacter>(HEROES_MOCK[1].id)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const onNextHandler = async () => {
    await dispatch(initGameThunk(selectedHero))
    onNext()
  }

  return (
    <div className={classes['root']}>
      <div className={classes['header']}>
        <Button onClick={onBack}><span>{t('back')}</span></Button>
        <Button className={classes['title-button']} interactive={false}><span>{t('chooseHero')}</span></Button>
        <Button onClick={onNextHandler}><span>{t('next')}</span></Button>
      </div>
      <div className={classes['heroes']} ref={scrollContainerRef}>
        {HEROES_MOCK.map((hero) => (
          <HeroCard
            id={hero.id}
            key={hero.id}
            img={hero.img}
            stats={hero.stats}
            locked={hero.locked}
            selected={selectedHero === hero.id}
            onSelected={setSelectedHero}
          />
        ))}
      </div>
    </div>
  )
}