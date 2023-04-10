import { FC, ReactNode } from 'react'
import { GameText } from '../../../../../../../components/game-text/game-text'
import classes from './items-plate.module.sass'

interface ItemsPlateProps {
  title: string
  className?: string
  children: ReactNode
}
export const ItemsPlate: FC<ItemsPlateProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={`${classes['root']}`}>
      <GameText className={classes['title']} text={title} />
      <div className={`${classes['plate']} ${className || ''}`}>
        {children}
      </div>
    </div>
  )
}