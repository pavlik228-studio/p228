import {
  ProjectileType
} from '../../../../../../../survivor-simulation/src/lib/features/projectile/components/projectile'

export const ProjectileColors: { [key in ProjectileType]: number } = {
  [ProjectileType.Standard]: 0x7338FB,
  [ProjectileType.Enemy]: 0xD900AB,
  [ProjectileType.Ethernal]: 0x7338FB,
  [ProjectileType.EthernalShot]: 0x7338FB,
  [ProjectileType.Rocket]: 0xff0000,
}