import { DataType, defineComponent } from '@p228/ecs'

export const Enemy = defineComponent({
  type: DataType.u8,
  attackCooldown: DataType.u16,
})