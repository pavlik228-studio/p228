import { DataType, defineComponent } from '@p228/ecs'

export const EnemyAttack = defineComponent({
  type: DataType.u8,
  chargeIn: DataType.u32,
  ownerRef: DataType.u32,
  cooldown: DataType.u32,
})