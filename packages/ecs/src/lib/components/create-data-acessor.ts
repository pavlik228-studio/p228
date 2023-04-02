import { DataType, DataTypeViewConstructor, TypedArray } from '../allocator/data-type'
import { DataViewHelper } from '../misc/data-view-helper'
import { IComponentDataAccessorInternal, IComponentInternal, IComponentSchema } from './types'

export function createComponentDataAccessor<TSchema extends IComponentSchema>(
  component: IComponentInternal<TSchema>,
  dataView: DataView,
): IComponentDataAccessorInternal<TSchema> {
  const accessor = {} as IComponentDataAccessorInternal<TSchema>

  accessor.__INDEX = 0

  const keys = component.__KEYS
  const offsets = component.__OFFSETS

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const type = component.__SCHEMA[key]
    const offset = offsets[i]
    if (Array.isArray(type)) {
      const [ dataType, length ] = type
      fixedArrayAccessor(accessor, dataView, key, dataType, offset, component.__BYTE_LENGTH, length)
    } else {
      primitiveAccessor(accessor, dataView, key, type as DataType, offset, component.__BYTE_LENGTH)
    }
  }

  return accessor
}

function primitiveAccessor<TSchema extends IComponentSchema>(
  accessor: IComponentDataAccessorInternal<TSchema>,
  dataView: DataView,
  propertyKey: keyof TSchema,
  propertyType: DataType,
  propertyOffset: number,
  offsetStep: number,
): void {
  const typedGetter = DataViewHelper.createGetter(dataView, propertyType)
  const typedSetter = DataViewHelper.createSetter(dataView, propertyType)

  Object.defineProperty(accessor, propertyKey, {
    get(): number {
      return typedGetter(this.__INDEX * offsetStep + propertyOffset)
    },
    set(value: number): void {
      typedSetter(this.__INDEX * offsetStep + propertyOffset, value)
    },
    enumerable: true,
  })
}

function fixedArrayAccessor<TSchema extends IComponentSchema>(
  accessor: IComponentDataAccessorInternal<TSchema>,
  dataView: DataView,
  propertyKey: keyof TSchema,
  propertyType: DataType,
  propertyOffset: number,
  offsetStep: number,
  fixedArrayLength: number,
): void {
  const dataViewOffset = dataView.byteOffset + propertyOffset
  Object.defineProperty(accessor, propertyKey, {
    get(): TypedArray {
      return new DataTypeViewConstructor[propertyType](dataView.buffer, this.__INDEX * offsetStep + dataViewOffset, fixedArrayLength)
    },
    set() {
      throw new Error('Cannot set fixed array, use array "[]" accessor instead')
    },
    enumerable: true,
  })
}