import { DataType, defineComponent } from '@p228/ecs'

export const Item = defineComponent({
  id: DataType.u8,
  ownerRef: DataType.u32,
})