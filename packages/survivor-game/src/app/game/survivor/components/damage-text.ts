import { EntityRef } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { Resizer } from '@p228/renderer-2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { BitmapFont, BitmapText, Container, IBitmapFontOptions } from 'pixi.js'
import { Player } from '../../../../../../survivor-simulation/src/lib/features/player/components/player'
import {
  DamageEvent,
  DamageEventData,
} from '../../../../../../survivor-simulation/src/lib/features/weapon/events/damage'
import { FxGroup } from '../layer-groups'

const FontOptions: IBitmapFontOptions = {
  resolution: Resizer.getDevicePixelRatio(),
  chars: [ ...BitmapFont.NUMERIC, '+', '-' ],
}

const FONT_SIZE = 32

BitmapFont.from('SofiaSansHeroDamage', {
  fontFamily: 'Sofia Sans',
  fontWeight: '600',
  fontSize: FONT_SIZE,
  fill: 0xFF0000,
  stroke: 0x000000,
  strokeThickness: 1,
}, FontOptions)
BitmapFont.from('SofiaSansEnemyDamage', {
  fontFamily: 'Sofia Sans',
  fontWeight: '600',
  fontSize: FONT_SIZE,
  fill: 0x000000,
}, FontOptions)
BitmapFont.from('SofiaSansHeal', {
  fontFamily: 'Sofia Sans',
  fontWeight: '600',
  fontSize: FONT_SIZE,
  fill: 0x00FF00,
  stroke: 0x000000,
  strokeThickness: 1,
}, FontOptions)

const ANIMATION_TIME = 800
const OFFSET_Y = 50

export class DamageText extends Container {
  private _playerRef: EntityRef | undefined
  private _time = 0
  private readonly _damageTexts = new Map<BitmapText, number>()

  constructor(
    private readonly _world: SurvivorWorld,
    private readonly _playerSlot: number,
  ) {
    super()
    this._world.simulationEvents.Predicted.subscribe(DamageEvent, this.onDamage)
  }

  public update(deltaTime: number): void {
    this._time += deltaTime
    if (this._playerRef === undefined) {
      this._playerRef = this.getPlayerRef(this._playerSlot)
      return
    }
    for (const [ damageText, createdAt ] of this._damageTexts) {
      const progress = (this._time - createdAt) / ANIMATION_TIME
      let alpha = 1 - progress
      if (alpha > 0.4) alpha = 1
      damageText.alpha = alpha
      damageText.y -= deltaTime * 0.1
      if (progress >= 1) {
        this._damageTexts.delete(damageText)
        damageText.destroy()
      }
    }
  }

  public override destroy(): void {
    super.destroy()
    this._world.simulationEvents.Predicted.unsubscribe(DamageEvent, this.onDamage)
  }

  private readonly onDamage = (_: number, event: DamageEventData) => {
    const damageText = new BitmapText(formatDamage(event.damage), {
      fontSize: FONT_SIZE,
      fontName: event.damage > 0
        ? 'SofiaSansHeal'
        : event.damageByRef === this._playerRef
          ? 'SofiaSansEnemyDamage'
          : 'SofiaSansHeroDamage',
    })
    damageText.parentGroup = FxGroup
    damageText.x = Transform2d.x[event.entityRef]
    damageText.y = -Transform2d.y[event.entityRef] - OFFSET_Y
    damageText.anchor.set(0.5, 0.5)
    this.addChild(damageText)
    this._damageTexts.set(damageText, this._time)
  }

  private getPlayerRef(playerSlot: number): EntityRef {
    for (const playerRef of this._world.filterPlayer) {
      if (Player.slot[playerRef] === this._playerSlot) {
        return playerRef
      }
    }

    throw new Error(`Player with slot ${playerSlot} not found`)
  }
}

function formatDamage(damage: number): string {
  return damage > 0 ? `+${damage}` : `${damage}`
}