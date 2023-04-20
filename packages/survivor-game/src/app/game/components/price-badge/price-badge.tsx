import React, { FC, MouseEventHandler } from 'react'
import { Gold } from '../../../components/gold/gold'
import classes from './price-badge.module.sass'

interface PriceBadgeProps {
  price: number
  onClick?: MouseEventHandler<HTMLDivElement>
  className?: string
}
export const PriceBadge: FC<PriceBadgeProps> = ({
  price,
  onClick,
  className
}) => {
  return (
    <div className={`${classes['root']} ${className}`} onClick={onClick}>
      <Gold className={classes['gold']} />
      <div className={classes['x']}>x</div>
      <div className={classes['price']}>{price}</div>
    </div>
  )
}