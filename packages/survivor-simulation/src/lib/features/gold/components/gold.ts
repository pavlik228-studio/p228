import { DataType, defineComponent } from '@p228/ecs'

export const Gold = defineComponent({
  xp: DataType.u8,
  gold: DataType.u8,
  collectedByRef: DataType.i32,
  createdAt: DataType.u32,
  speed: DataType.u8,
})