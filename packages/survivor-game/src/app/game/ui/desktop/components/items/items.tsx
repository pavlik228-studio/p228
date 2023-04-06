import { FC } from 'react'
import classes from './items.module.sass'

interface ItemsProps {
  onNext: () => void
  onBack: () => void
}
export const Items: FC<ItemsProps> = ({ onNext, onBack }) => {
  return (
    <div className={classes['root']}>

    </div>
  )
}