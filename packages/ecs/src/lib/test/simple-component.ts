import { DataType } from '../allocator/data-type'
import { ComponentSchema } from '../components/component-schema'

export class SimpleComponent extends ComponentSchema {
  public override registerSchema() {
    return {
      x: DataType.f32,
      y: DataType.f32,
    }
  }
}