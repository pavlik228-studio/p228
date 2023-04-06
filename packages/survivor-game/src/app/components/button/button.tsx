import { FC, ReactNode } from 'react'
import classes from './button.module.sass'

interface ButtonProps {
  children: ReactNode | string
  onClick?: () => void
  className?: string
  disabled?: boolean
  interactive?: boolean
}
export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  className,
  disabled,
  interactive = true
}) => {
  return (
    <button className={`${classes['root']} ${className} ${interactive ? '' : classes['not-interactive']}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}