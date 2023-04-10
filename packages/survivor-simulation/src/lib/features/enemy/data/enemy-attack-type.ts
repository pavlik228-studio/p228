export enum EnemyAttackType {
  Melee,
  Shoot,
  Ram,
}

export interface IEnemyAttackValues {
  cooldown: number
  chargeTime: number
  damage: number
  chargeRange: number
  attackRange: number
}

export const EnemyAttackData = new Map<EnemyAttackType, IEnemyAttackValues>([
  [ EnemyAttackType.Melee, { cooldown: 60, chargeTime: 20, damage: 10, chargeRange: Math.pow(140, 2), attackRange: Math.pow(150, 2) } ],
  [ EnemyAttackType.Ram, { cooldown: 180, chargeTime: 60, damage: 20, chargeRange: Math.pow(500, 2), attackRange: Math.pow(150, 2) } ],
  [ EnemyAttackType.Shoot, { cooldown: 360, chargeTime: 24, damage: 20, chargeRange: Math.pow(400, 2), attackRange: 0 } ],
])