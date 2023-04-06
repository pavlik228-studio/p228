import { DataType, defineComponent } from '@p228/ecs'

export const Transform2d = defineComponent({
  x: DataType.f32,
  y: DataType.f32,
  rotation: DataType.f32,
  prevX: DataType.f32,
  prevY: DataType.f32,
  prevRotation: DataType.f32,
})