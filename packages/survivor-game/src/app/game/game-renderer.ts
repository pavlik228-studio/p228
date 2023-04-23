import { Renderer2D } from '@p228/renderer-2d'
import { GameScene } from './survivor/game-scene'

export class GameRenderer extends Renderer2D {
  constructor(renderCanvas: HTMLCanvasElement) {
    super(renderCanvas, GameScene, false)
  }
}