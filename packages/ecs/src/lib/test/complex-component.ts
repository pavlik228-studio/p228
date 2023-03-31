import { DataType } from '../allocator/data-type'
import { ComponentSchema } from '../components/component-schema'
import { IFixedList } from '../components/component.types'

export class ComplexComponent extends ComponentSchema {
  public override registerSchema() {
    return {
      id: [ DataType.u8, 16 ] as IFixedList,
      slot: DataType.u8,
    }
  }
}