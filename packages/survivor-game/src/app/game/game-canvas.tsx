import React, { FC, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { setGameScene } from '../store/features/game/game-slice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import classes from './game-canvas.module.sass'
import { GameRenderer } from './game-renderer'
import { GameScene } from './survivor/game-scene'

interface GameCanvasProps {
  isShown: boolean
}
const GameCanvas: FC<GameCanvasProps> = ({ isShown }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dispatch = useAppDispatch()
  const { gameScene } = useAppSelector((state) => state.game)

  useEffect(() => {
    const gameRenderer = new GameRenderer(canvasRef.current!)
    const gameScene = gameRenderer.sceneManager.activeScene as GameScene
    dispatch(setGameScene(gameScene))

    return () => {
      gameRenderer.destroy()
    }
  }, [])

  return (
    <>
      <canvas className={classes['canvas']} ref={canvasRef} style={{ display: isShown ? 'block' : 'none' }} />
      {!gameScene ? null : <Outlet />}
    </>
  )
}

export default GameCanvas