import { FC } from 'react'
import { Gold } from '../../../../../../../components/gold/gold'
import classes from './price-badge.module.sass'

interface PriceBadgeProps {
  price: number
  className?: string
}
export const PriceBadge: FC<PriceBadgeProps> = ({ price, className}) => {
  return (
    <div className={`${classes['root']} ${className}`}>
      <Gold className={classes['gold']} />
      <div className={classes['x']}>x</div>
      <div className={classes['price']}>{price}</div>
    </div>
  )
}