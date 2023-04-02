import { DataType, DataTypeSize } from '../allocator/data-type'
import { IComponentInternal, IComponentSchema, IComponentSchemaField } from './types'

export function defineComponent<TSchema extends IComponentSchema>(schema: TSchema): IComponentInternal<TSchema> {
  const component = {} as IComponentInternal<TSchema>

  const keys = Object.keys(schema).sort() as Array<keyof TSchema>
  const offsets = new Array<number>(keys.length)
  let byteLength = 0

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const type = schema[key] as IComponentSchemaField
    offsets[i] = byteLength
    if (Array.isArray(type)) {
      const [ dataType, length ] = type
      byteLength += DataTypeSize[dataType] * length
    } else {
      byteLength += DataTypeSize[type as DataType]
    }
  }

  component.__KEYS = keys as string[]
  component.__OFFSETS = offsets
  component.__BYTE_LENGTH = byteLength
  component.__SCHEMA = schema

  return component
}