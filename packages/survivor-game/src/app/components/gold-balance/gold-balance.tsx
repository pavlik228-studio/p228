import { FC } from 'react'
import { useAppSelector } from '../../store/hooks'
import { Button } from '../button/button'
import { Gold } from '../gold/gold'
import classes from './gold-balance.module.sass'

interface GoldBalanceProps {
  className?: string
}
export const GoldBalance: FC<GoldBalanceProps> = ({
  className,
}) => {

  const { goldBalance } = useAppSelector((state) => state.game)

  return (
    <Button className={`${classes['root']} ${className || ''}`} interactive={false}>
      <Gold className={`${classes['gold']}`} />
      <span className={classes['balance']}>{goldBalance}</span>
    </Button>
  )
}