import { DataType, defineComponent } from '@p228/ecs'

export const PhysicsRefs = defineComponent({
  colliderRef: DataType.f64,
  rigidBodyRef: DataType.f64,
})