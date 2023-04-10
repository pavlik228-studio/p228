import { DataType, defineComponent } from '@p228/ecs'

export const EnemyActiveAttack = defineComponent({
  attackRef: DataType.u32,
  targetX: DataType.f32,
  targetY: DataType.f32,
})