import { AnimatedSprite, Spritesheet } from 'pixi.js'

interface IAnimatorStates<TContext> {
  [key: string]: {
    onEnter?: (animator: Animator<TContext, any>, context: TContext, prevState: string) => void,
    onExit?: (animator: Animator<TContext, any>, context: TContext, nextState: string) => void,
  }
}

export class Animator<TContext, TStates extends IAnimatorStates<TContext>> {
  constructor(
    public readonly animatedSprite: AnimatedSprite,
    public readonly spritesheet: Spritesheet,
    public readonly context: TContext,
    public readonly states: TStates,
    public readonly nextState: (context: TContext) => keyof TStates,
  ) {
    this._currentState = this.nextState(context)
  }

  private _currentState: keyof TStates

  public get currentState(): keyof TStates {
    return this._currentState
  }

  public update(): void {
    const nextState = this.nextState(this.context)

    if (nextState === this._currentState) return

    const prevState = this._currentState
    const state = this.states[nextState]

    if (!state) throw new Error(`State ${String(nextState)} is not defined`)

    if (state.onExit !== undefined) state.onExit(this, this.context, nextState as string)
    if (state.onEnter !== undefined) state.onEnter(this, this.context, prevState as string)

    this.animatedSprite.play()

    this._currentState = nextState
  }

}