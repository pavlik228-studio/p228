import { EntityRef } from '@p228/ecs'
import { SurvivorWorld } from '@p228/survivor-simulation'
import i18next from 'i18next'
import { Container } from 'pixi.js'
import { Health } from '../../../../../../../survivor-simulation/src/lib/features/attack/components/health'
import { Player } from '../../../../../../../survivor-simulation/src/lib/features/player/components/player'
import { GameRenderer } from '../../../game-renderer'
import { HUDGoldBalance } from './gold-balance'
import { HUDTimer } from './timer'
import { HUDHp } from './hp'
import { HUDWaves } from './waves-plate'
import { HUDXp } from './xp'

export class Hud extends Container {
  private readonly _timer: HUDTimer
  private readonly _hp: HUDHp
  private readonly _xp: HUDXp
  private readonly _goldBalance: HUDGoldBalance
  private readonly _wavesPlate: HUDWaves

  constructor(
    private readonly _gameRenderer: GameRenderer,
  ) {
    super()
    this._timer = new HUDTimer(_gameRenderer)
    this.addChild(this._timer)

    this._hp = new HUDHp(_gameRenderer)
    this.addChild(this._hp)

    this._xp = new HUDXp(_gameRenderer)
    this.addChild(this._xp)

    this._goldBalance = new HUDGoldBalance(_gameRenderer)
    this.addChild(this._goldBalance)

    this._wavesPlate = new HUDWaves(_gameRenderer)
    this.addChild(this._wavesPlate)
  }

  public reset(timerSeconds: number): void {
    this._timer.setSeconds(timerSeconds)
    this._hp.setValue(1, '')
    this._xp.setValue(0, '')
  }

  public onUpdate(playerSlot: number, _world: SurvivorWorld) {
    const playerEntityRef = this.tryGetPlayerEntityRef(playerSlot, _world)

    if (playerEntityRef === undefined) return

    const hp = Health.current[playerEntityRef] / Health.max[playerEntityRef]
    this._hp.setValue(hp, `${i18next.t('hp').toUpperCase()}: ${Health.current[playerEntityRef]}/${Health.max[playerEntityRef]}`)

    const xp = 1 - Health.current[playerEntityRef] / Health.max[playerEntityRef]
    this._xp.setValue(xp, `${i18next.t('xp').toUpperCase()}: ${Health.max[playerEntityRef] - Health.current[playerEntityRef]}/${Health.max[playerEntityRef]}`)

    const timer = Math.round(80 - (_world.tick * _world.config.deltaTime / 1000))
    this._timer.setSeconds(timer)

    this._goldBalance.setBalance(Player.goldBalance[playerEntityRef])

    this._wavesPlate.setWave(1, 10)
  }

  private tryGetPlayerEntityRef(playerSlot: number, world: SurvivorWorld): EntityRef | undefined {
    for (const entityRef of world.filterPlayer) {
      if (Player.slot[entityRef] === playerSlot) {
        return entityRef
      }
    }
    return undefined
  }
}