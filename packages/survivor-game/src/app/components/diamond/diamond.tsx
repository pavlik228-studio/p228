import { FC } from 'react'
import classes from './diamond.module.sass'

interface DiamondProps {
  className?: string
  size?: 'sm' | 'md'
}
export const Diamond: FC<DiamondProps> = ({
  className,
  size,
}) => {
  const sizeClass = size ? classes[size] : classes['md']
  return (
    <i className={`${classes['diamond']} ${className || ''} ${sizeClass}`} />
  )
}