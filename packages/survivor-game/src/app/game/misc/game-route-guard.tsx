import { FC } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export const GameRouteGuard: FC = () => {
  const { initialized } = useAppSelector((state) => state.game)

  return initialized ? null : (
    <Navigate to='/start' />
  )
}