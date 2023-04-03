import { DataType } from '../allocator/data-type'
import { defineComponent } from '../components/define-component'

export const TestComponent = defineComponent({
  a: DataType.f32,
  b: DataType.f32,
})