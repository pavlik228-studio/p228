import type { ColliderHandle } from '@dimforge/rapier2d'
import { EntityRef } from '@p228/ecs'
import { IVector2Like } from '@p228/math'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Weapon } from '../../components/weapon'
import { WeaponTargetsAttackedPool } from '../../misc/weapon-targets-attacked-pool'
import { IWeapon, WeaponAttackType, WeaponData, WeaponType } from '../weapon-type'

export abstract class AbstractWeaponAttack<TWeaponAttackType extends WeaponAttackType> {
  public readonly abstract attackType: WeaponAttackType
  protected _weaponEntityRef!: EntityRef
  protected _weaponType!: WeaponType
  protected _weaponValues!: IWeapon<TWeaponAttackType>
  protected _attackedTargets!: Array<ColliderHandle>

  constructor(
    protected readonly _world: SurvivorWorld,
    protected readonly _weaponTargetsAttackedPool: WeaponTargetsAttackedPool,
  ) {
  }

  protected abstract findTarget(): IVector2Like | undefined

  protected abstract attack(progress: number, target: IVector2Like | undefined): void


  public update(): void {
    // cooldown handling
    Weapon.cooldown[this._weaponEntityRef] = Math.max(0, Weapon.cooldown[this._weaponEntityRef] - 1)
    if (Weapon.cooldown[this._weaponEntityRef] > 0) return

    let target: IVector2Like | undefined

    // if attack is not started yet, find target
    if (Weapon.startedAt[this._weaponEntityRef] === 0) {
      target = this.findTarget()

      if (target === undefined) return

      // if target found, start attack
      this.onAttackStart()
    }

    // if attack is started, continue attack
    const attackProgress = this._weaponValues.duration !== undefined
      ? (this._world.tick - Weapon.startedAt[this._weaponEntityRef]) / this._weaponValues.duration
      : 1

    this.attack(attackProgress, target)

    if (attackProgress >= 1) {
      this.onAttackEnd()
    }
  }

  protected onAttackStart(): void {
    Weapon.startedAt[this._weaponEntityRef] = this._world.tick
  }

  protected onAttackEnd(): void {
    Weapon.cooldown[this._weaponEntityRef] = this._weaponValues.cooldown
    Weapon.startedAt[this._weaponEntityRef] = 0
  }

  public setContext(weaponEntityRef: EntityRef, weaponType: WeaponType, attackedTargets: Array<ColliderHandle>): void {
    this._weaponEntityRef = weaponEntityRef
    this._weaponType = weaponType
    this._weaponValues = WeaponData[weaponType] as any
    this._attackedTargets = attackedTargets
  }
}