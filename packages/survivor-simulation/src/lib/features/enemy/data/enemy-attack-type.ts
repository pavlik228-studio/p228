export enum EnemyAttackType {
  Melee,
  Shoot,
  Ram,
}

export interface IEnemyAttackValues {
  cooldown: number
  chargeTime: number
  baseDamage: number
  chargeRange: number
  attackRange: number
  projectileSpeed?: number
}

export const EnemyAttackData = new Map<EnemyAttackType, IEnemyAttackValues>([
  [ EnemyAttackType.Melee, { cooldown: 60, chargeTime: 20, baseDamage: 10, chargeRange: Math.pow(140, 2), attackRange: Math.pow(150, 2) } ],
  [ EnemyAttackType.Ram, { cooldown: 180, chargeTime: 90, baseDamage: 20, chargeRange: Math.pow(400, 2), attackRange: Math.pow(150, 2) } ],
  [ EnemyAttackType.Shoot, { cooldown: 120, chargeTime: 12, baseDamage: 20, chargeRange: Math.pow(400, 2), attackRange: 0, projectileSpeed: 10 } ],
])