import { FC } from 'react'
import classes from './gold.module.sass'

interface GoldProps {
  size?: 'sm' | 'md' | 'lg',
  className?: string,
}
export const Gold: FC<GoldProps> = ({
  size,
  className,
}) => {
  const sizeClass = size ? classes[size] : classes['md']
  return (
    <i className={`${classes['gold']} ${sizeClass} ${className || ''}`} />
  )
}