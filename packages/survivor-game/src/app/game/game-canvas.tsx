import { FC, useEffect, useRef } from 'react'
import classes from './game-canvas.module.sass'
import { GameRenderer } from './game-renderer'
import { GameScene } from './survivor/game-scene'

interface GameCanvasProps {
  isShown: boolean
}
export const GameCanvas: FC<GameCanvasProps> = ({ isShown }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRendererRef = useRef<GameRenderer>()

  useEffect(() => {
    const gameRenderer = new GameRenderer(canvasRef.current!)
    gameRendererRef.current = gameRenderer
    const gameScene = gameRenderer.sceneManager.activeScene as GameScene
    gameScene.startGame().catch(console.error)

    return () => {
      gameRenderer.destroy()
      gameRendererRef.current = undefined
    }
  }, [])

  return (
    <canvas className={classes['canvas']} ref={canvasRef} style={{ display: isShown ? 'block' : 'none' }} />
  )
}