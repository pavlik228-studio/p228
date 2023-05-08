import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../components/button/button'
import { GameText } from '../../../../components/game-text/game-text'
import { GoldBalance } from '../../../../components/gold-balance/gold-balance'
import classes from './level-up-screen.module.sass'

export const LevelUpScreen: FC = () => {
  const {t} = useTranslation()

  return (
    <div className={classes['root']}>
      <div className={classes['header']}>
        {/*<Button onClick={onBack}><span>{t('back')}</span></Button>*/}
        <GoldBalance/>
        <Button className={classes['title-button']} interactive={false}>
          <span>{t('levelUp')}</span>
        </Button>
        <Button><span>{t('next')}</span></Button>
      </div>
      <div className={classes['stats']}>
        <GameText
          text={t('levelUpScreen.title')}
          className={classes['stats__title']}
        />
      </div>
    </div>
  )
}