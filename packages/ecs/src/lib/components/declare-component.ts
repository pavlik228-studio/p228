import { DataType, DataTypeSize } from '../allocator/data-type'
import { IComponent, IComponentSchema } from './component.types'

export function declareComponent<T extends IComponentSchema>(schema: T): IComponent<T> {
  const component = Object.create(null) as IComponent<T>

  let bytesPerElement = 0
  for (const key in schema) {
    const value = schema[key]
    if (Array.isArray(value)) {
      const [ dataType, size ] = value
      bytesPerElement += DataTypeSize[dataType] * size
    } else {
      bytesPerElement += DataTypeSize[value as DataType]
    }
  }

  component._BYTES_PER_ELEMENT = bytesPerElement
  component._FIELDS_COUNT = Object.keys(schema).length
  component._SCHEMA = schema


  return component
}