import { DataType, defineComponent } from '@p228/ecs'

export const Health = defineComponent({
  max: DataType.u16,
  current: DataType.u16,
  lastDamageAt: DataType.u32,
  // lastDamageBy: DataType.u32,
})