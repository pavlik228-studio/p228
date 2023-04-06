import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/button/button'
import classes from './title-screen.module.sass'

export const DesktopTitleScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <div className={classes['root']}>
      <div className={classes['content']}>
        <Button className={classes['button']} onClick={() => navigate('/start')}><span>Play</span></Button>
        <Button className={classes['button']}><span>Leaderboard</span></Button>
        <Button className={classes['button']}><span>Settings</span></Button>
        <Button className={classes['button']}><span>Shop</span></Button>
        <div className={classes['logo']} />
      </div>
    </div>
  )
}