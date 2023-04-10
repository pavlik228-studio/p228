import { EnemyAttackType } from './enemy-attack-type'

export enum EnemyType {
  MeleeSkull,
  RangeSkull,
  ShieldSkull,
  RamSkull,
}

export interface IEnemyValues {
  collider: { halfHeight: number, radius: number }
  spritePivot: { x: number, y: number }
  attacks: Array<EnemyAttackType>
  loopAttack?: boolean
}

export const EnemyData = new Map<EnemyType, IEnemyValues>([
  [ EnemyType.MeleeSkull, { collider: { halfHeight: 32, radius: 24 }, spritePivot: { x: 0, y: 48 }, attacks: [ EnemyAttackType.Melee ], } ],
  [ EnemyType.RamSkull, { collider: { halfHeight: 48, radius: 48 }, spritePivot: { x: 0, y: 96 }, attacks: [ EnemyAttackType.Ram ], } ],
  [ EnemyType.RangeSkull, { collider: { halfHeight: 48, radius: 24 }, spritePivot: { x: 0, y: 48 }, attacks: [ EnemyAttackType.Shoot ], loopAttack: true, } ],
  [ EnemyType.ShieldSkull, { collider: { halfHeight: 48, radius: 24 }, spritePivot: { x: 0, y: 48 }, attacks: [ EnemyAttackType.Melee ], } ],
])