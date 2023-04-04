import { DataType } from '../allocator/data-type'
import { defineComponent } from '../components/define-component'

export const PositionComponent = defineComponent({
  x: DataType.f32,
  y: DataType.f32,
})