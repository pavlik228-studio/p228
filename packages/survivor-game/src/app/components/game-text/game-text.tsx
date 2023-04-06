import { FC } from 'react'
import classes from './game-text.module.sass'

interface GameTextProps {
  text: string
  className?: string
}
export const GameText: FC<GameTextProps> = ({
  text,
  className = '',
}) => {
  return (
    <div className={`${classes['root']} ${className}`}>{text}</div>
  )
}