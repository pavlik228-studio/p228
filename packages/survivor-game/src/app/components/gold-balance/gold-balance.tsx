import { FC } from 'react'
import { Button } from '../button/button'
import { Gold } from '../gold/gold'
import classes from './gold-balance.module.sass'

interface GoldBalanceProps {
  balance: number
  className?: string
}
export const GoldBalance: FC<GoldBalanceProps> = ({
  balance,
  className,
}) => {
  return (
    <Button className={`${classes['root']} ${className}`} interactive={false}>
      <Gold className={`${classes['gold']}`} />
      <span className={classes['balance']}>{balance}</span>
    </Button>
  )
}