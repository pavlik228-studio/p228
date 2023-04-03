import { DataType, DataTypeSize } from '../allocator/data-type'
import { IComponent, IComponentSchema } from './component.types'

const defaultOptions = {
  dangerouslySetLimit: 0,
}

export function defineComponent<T extends IComponentSchema>(schema: T, options = defaultOptions): IComponent<T> {
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
  if (options.dangerouslySetLimit > 0) component._LIMIT = options.dangerouslySetLimit


  return component
}