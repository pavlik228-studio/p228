import { InputProvider } from '../input/input-provider'

export class TestInputProvider extends InputProvider {
  private _lastInputTick: undefined | number = undefined
  public override getInvalidateTick(): number | undefined {
    return this._lastInputTick
  }

  public setTick(tick: number): void {
    this._lastInputTick = tick
  }
}