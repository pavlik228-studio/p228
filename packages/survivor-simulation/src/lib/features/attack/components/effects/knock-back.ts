import { DataType, defineComponent } from '@p228/ecs'

export const KnockBack = defineComponent({
  x: DataType.f32,
  y: DataType.f32,
  duration: DataType.u16,
})