import { DataType } from '../allocator/data-type'
import { declareComponent } from '../components/declare-component'

export const TestComponent = declareComponent({
  a: DataType.f32,
  b: DataType.f32,
})