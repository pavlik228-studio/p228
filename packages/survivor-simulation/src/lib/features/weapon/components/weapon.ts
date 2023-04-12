import { DataType, defineComponent } from '@p228/ecs'

export const Weapon = defineComponent({
  type: DataType.u8,
  attackType: DataType.u8,
  level: DataType.u8,
  cooldown: DataType.u16,
  ownerRef: DataType.u32,
  offsetX: DataType.f32,
  offsetY: DataType.f32,
  originX: DataType.f32,
  originY: DataType.f32,
  targetX: DataType.f32,
  targetY: DataType.f32,
  startedAt: DataType.u32,
})