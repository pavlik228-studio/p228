import { DataType, defineComponent } from '@p228/ecs'

export const Player = defineComponent({
  slot: DataType.u8,
  direction: DataType.f32,
  speed: DataType.f32,
})