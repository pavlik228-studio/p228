import { Animator } from '@p228/renderer-2d'
import { AnimatedSprite, Spritesheet } from 'pixi.js'

const PlayerAnimatorStates = {
  Idle: {
    onEnter(animator: Animator<IPlayerAnimatorContext, any>) {
      animator.animatedSprite.textures = animator.spritesheet.animations['Idle']
    }
  },
  Walk: {
    onEnter(animator: Animator<IPlayerAnimatorContext, any>) {
      animator.animatedSprite.textures = animator.spritesheet.animations['Running']
    }
  },
  Hurt: {
    onEnter(animator: Animator<IPlayerAnimatorContext, any>) {
      animator.animatedSprite.textures = animator.spritesheet.animations['Hurt']
    }
  },
  Dead: {
    onEnter(animator: Animator<IPlayerAnimatorContext, any>) {
      animator.animatedSprite.textures = animator.spritesheet.animations['Dying']
    }
  },
}

interface IPlayerAnimatorContext {
  speed: number,
  health: number,
  lastDamageAt: number | undefined,
  isDead: boolean,
}

const nextState = (context: IPlayerAnimatorContext): keyof typeof PlayerAnimatorStates => {
  if (context.isDead) return 'Dead'
  if (context.lastDamageAt !== undefined && context.lastDamageAt < 100) return 'Hurt'
  if (context.speed > 0) return 'Walk'
  return 'Idle'
}

export class PlayerAnimator extends Animator<IPlayerAnimatorContext, any> {
  constructor(animatedSprite: AnimatedSprite, spritesheet: Spritesheet, ctx: IPlayerAnimatorContext) {
    super(animatedSprite, spritesheet, ctx, PlayerAnimatorStates, nextState)
  }
}