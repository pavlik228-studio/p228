import { ProjectileType } from '@p228/survivor-simulation'

export const ProjectileColors: { [key in ProjectileType]: number } = {
  [ProjectileType.Standard]: 0x7338FB,
  [ProjectileType.Enemy]: 0xD900AB,
  [ProjectileType.Ethernal]: 0x7338FB,
  [ProjectileType.EthernalShot]: 0x7338FB,
  [ProjectileType.EthernalRocket]: 0x7338FB,
}