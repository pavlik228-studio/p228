import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/button/button'
import classes from './title-screen.module.sass'

export const DesktopTitleScreen: FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className={classes['root']}>
      <div className={classes['content']}>
        <Button className={classes['button']} onClick={() => navigate('/start')}><span>{t('play')}</span></Button>
        <Button className={classes['button']}><span>{t('leaderboard')}</span></Button>
        <Button className={classes['button']}><span>{t('settings')}</span></Button>
        <Button className={classes['button']}><span>{t('shop')}</span></Button>
        <div className={classes['logo']} />
      </div>
    </div>
  )
}