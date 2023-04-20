import type { ColliderHandle } from '@dimforge/rapier2d'
import { AbstractSystem, EntityRef, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Weapon } from '../components/weapon'
import { AbstractWeaponAttack } from '../data/attacks/abstract-weapon-attack'
import { WeaponAttackProjectile } from '../data/attacks/weapon-attack-projectile'
import { WeaponAttackRocketProjectile } from '../data/attacks/weapon-attack-rocket-projectile'
import { WeaponAttackSpotProjectile } from '../data/attacks/weapon-attack-spot-projectile'
import { WeaponAttackThrust } from '../data/attacks/weapon-attack-thrust'
import { WeaponAttackType } from '../data/weapon-type'
import { WeaponTargetsAttackedPool } from '../misc/weapon-targets-attacked-pool'

const ATTACKED_TARGETS_MAP = new Map<EntityRef, Array<ColliderHandle>>()

export class WeaponAiSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _weaponFilter: Filter
  private readonly _weaponAttacks = new Map<WeaponAttackType, AbstractWeaponAttack<any>>()
  private _weaponTargetsAttackedPool!: WeaponTargetsAttackedPool
  private _entitiesToDestroy: Array<EntityRef> = []

  constructor(world: SurvivorWorld) {
    super(world)
    this._weaponFilter = world.registerFilter(new Filter([ Weapon, Transform2d ]))
  }

  public override initialize() {
    this._weaponTargetsAttackedPool = new WeaponTargetsAttackedPool(this.world)

    this._weaponAttacks.set(WeaponAttackType.Thrust, new WeaponAttackThrust(this.world, this._weaponTargetsAttackedPool))
    this._weaponAttacks.set(WeaponAttackType.Projectile, new WeaponAttackProjectile(this.world, this._weaponTargetsAttackedPool))
    this._weaponAttacks.set(WeaponAttackType.SpotProjectile, new WeaponAttackSpotProjectile(this.world, this._weaponTargetsAttackedPool))
    this._weaponAttacks.set(WeaponAttackType.RocketProjectile, new WeaponAttackRocketProjectile(this.world, this._weaponTargetsAttackedPool))
  }

  public destroyPlayerWeapon(playerRef: EntityRef) {
    this._entitiesToDestroy.length = 0
    for (const weaponRef of this._weaponFilter) {
      if (Weapon.ownerRef[weaponRef] !== playerRef) continue
      this._entitiesToDestroy.push(weaponRef)
    }

    for (const weaponRef of this._entitiesToDestroy) {
      this.world.entityManager.destroyEntity(weaponRef)
    }
  }

  public override update(): void {
    for (const [ , attackedTargets ] of ATTACKED_TARGETS_MAP) attackedTargets.length = 0

    for (const weaponEntityRef of this._weaponFilter) {
      let attackedTargets = ATTACKED_TARGETS_MAP.get(weaponEntityRef)
      if (attackedTargets === undefined) {
        attackedTargets = new Array<ColliderHandle>()
        ATTACKED_TARGETS_MAP.set(weaponEntityRef, attackedTargets)
      }
      const attackAttack = this._weaponAttacks.get(Weapon.attackType[weaponEntityRef])
      if (attackAttack === undefined) throw new Error(`Weapon attack type "${Weapon.attackType[weaponEntityRef]} (${WeaponAttackType[Weapon.attackType[weaponEntityRef]]})" not implemented`)
      attackAttack.setContext(weaponEntityRef, Weapon.type[weaponEntityRef], attackedTargets)
      attackAttack.update()
    }
  }
}