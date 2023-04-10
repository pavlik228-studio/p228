import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameText } from '../../components/game-text/game-text'
import classes from './splash-screen.module.sass'

export const SplashScreen: FC = () => {
  const [ loadingIndicator, setLoadingIndicator ] = useState('...')
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      if (loadingIndicator.length === 3) {
        setLoadingIndicator('')
      } else {
        setLoadingIndicator(loadingIndicator + '.')
      }
    }, 700)
    return () => clearInterval(interval)
  }, [ loadingIndicator ])

  return (
    <div className={classes['root']}>
      <div className={classes['logo']}/>
      <GameText className={classes['loading']} text={`${t('loading')}${loadingIndicator}`}/>
    </div>
  )
}