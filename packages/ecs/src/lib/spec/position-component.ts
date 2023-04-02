import { DataType } from '../allocator/data-type'
import { declareComponent } from '../components/declare-component'

export const PositionComponent = declareComponent({
  x: DataType.f32,
  y: DataType.f32,
})