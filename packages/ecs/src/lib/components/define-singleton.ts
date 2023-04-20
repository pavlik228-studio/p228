import { DataType, DataTypeSize } from '../allocator/data-type'
import { IComponentSchema, ISingletonComponent, ISingletonComponentAccessor } from './component.types'
import { defineComponent } from './define-component'

export function defineSingletonComponent<TSchema extends IComponentSchema>(schema: TSchema, createAccessor: ISingletonComponentAccessor<TSchema>): ISingletonComponent<TSchema> {
  const component = defineComponent(schema) as unknown as ISingletonComponent<TSchema>
  component._LIMIT = 1
  component._ACCESSOR = createAccessor

  let bytesPerElement = 0
  for (const key in schema) {
    const value = schema[key]
    if (Array.isArray(value)) {
      const [ dataType, size ] = value
      bytesPerElement += Math.ceil((DataTypeSize[dataType] * size) / 8) * 8
    } else {
      bytesPerElement += Math.ceil(DataTypeSize[value as DataType] / 8) * 8
    }
  }

  component._BYTES_PER_ELEMENT = bytesPerElement

  return component
}