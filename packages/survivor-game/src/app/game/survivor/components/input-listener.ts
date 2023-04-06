import { InputProvider } from '@p228/engine'
import { MathOps } from '@p228/math'
import { MoveData, SurvivorInputSchema, SurvivorRpc } from '@p228/survivor-simulation'

export class InputListener {
  private readonly _inputs = {top: false, right: false, bottom: false, left: false}
  private _prevInputHash: number | undefined

  constructor(
    private readonly _inputProvider: InputProvider<typeof SurvivorInputSchema>,
  ) {
    window.addEventListener('keydown', this.onKeydown)
    window.addEventListener('keyup', this.onKeyup)
  }

  public setMovement(direction: number, speed: number) {
    const hash = this.getHash(direction, speed)

    if (this._prevInputHash === hash) return

    this._prevInputHash = hash
    this._inputProvider.setRpc(SurvivorRpc.Move, new MoveData(direction, speed))
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('keyup', this.onKeyup)
  }

  private readonly onKeydown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this._inputs.top = true
        break
      case 'KeyD':
      case 'ArrowRight':
        this._inputs.right = true
        break
      case 'KeyS':
      case 'ArrowDown':
        this._inputs.bottom = true
        break
      case 'KeyA':
      case 'ArrowLeft':
        this._inputs.left = true
        break
    }

    this.setMovement(this.getDirection(), this.getSpeed())
  }

  private readonly onKeyup = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this._inputs.top = false
        break
      case 'KeyD':
      case 'ArrowRight':
        this._inputs.right = false
        break
      case 'KeyS':
      case 'ArrowDown':
        this._inputs.bottom = false
        break
      case 'KeyA':
      case 'ArrowLeft':
        this._inputs.left = false
        break
    }

    this.setMovement(this.getDirection(), this.getSpeed())
  }

  private getDirection(): number {
    let x = 0
    let y = 0

    if (this._inputs.top) y += 1
    if (this._inputs.bottom) y -= 1
    if (this._inputs.left) x -= 1
    if (this._inputs.right) x += 1

    return MathOps.atan2(y, x)
  }

  private getHash(direction: number, speed: number): number {
    let hash = (direction * 1000) << 5
    hash += (speed * 1000) << 6

    return hash
  }

  private getSpeed(): number {
    return this._inputs.top || this._inputs.bottom || this._inputs.left || this._inputs.right ? 1 : 0
  }
}