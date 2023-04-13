import { DataType, defineComponent } from '@p228/ecs'

export enum ProjectileType {
  Standard = 0,
  Enemy,
  Ethernal,
  EthernalShot,
  Rocket,
}

export const Projectile = defineComponent({
  type: DataType.u8,
  ownerRef: DataType.u32,
  directionX: DataType.f32,
  directionY: DataType.f32,
  speed: DataType.f32,
  damage: DataType.f32,
})