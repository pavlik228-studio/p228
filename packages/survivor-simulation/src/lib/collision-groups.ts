// indicates what groups the collider is part of (one bit per group)
export enum CollisionMembership {
  Player = 0b0000_0000_0000_0001,
  Enemy = 0b0000_0000_0000_0010,
  PlayerProjectile = 0b0000_0000_0000_0100,
  EnemyProjectile = 0b0000_0000_0000_1000,
  Gold = 0b0000_0000_0001_0000,
}

// indicates what groups the collider can interact with (one bit per group)
export enum CollisionFilters {
  Player = 0b0000_0000_0000_0011,
  Enemy = 0b0000_0000_0000_0111,
  PlayerProjectile = 0b0000_0000_0000_0010,
  EnemyProjectile = 0b0000_0000_0000_0001,
  Gold = 0b0000_0000_0001_0000,
}

export enum CollisionGroups {
  Player = (CollisionMembership.Player << 16) | CollisionFilters.Player,
  Enemy = (CollisionMembership.Enemy << 16) | CollisionFilters.Enemy,
  ShootableEnemy = (CollisionMembership.Enemy << 16) | CollisionFilters.PlayerProjectile,
  ShootablePlayer = (CollisionMembership.Player << 16) | 0b0000_0000_0000_0001,
  PlayerProjectile = (CollisionMembership.PlayerProjectile << 16) | CollisionFilters.PlayerProjectile,
  EnemyProjectile = (CollisionMembership.Player << 16) | CollisionFilters.EnemyProjectile,
  Gold = (CollisionMembership.Gold << 16) | CollisionFilters.Gold,
}
