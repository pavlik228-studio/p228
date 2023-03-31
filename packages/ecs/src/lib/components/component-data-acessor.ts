import { DataType, DataTypeViewConstructor, TypedArray } from '../allocator/data-type'
import { ComponentSchema } from './component-schema'
import { IComponentDataAccessor, IComponentInstanceSchema, IComponentSchema } from './component.types'
import { DataViewHelper } from '../misc/data-view-helper'

const componentDataAccessorPrototype = Object.create(null, {
  copy: {
    enumerable: false,
    value() {
      const accessor = Object.create(componentDataAccessorPrototype) as IComponentDataAccessor

      for (const key in this) accessor[key] = this[key]

      return accessor
    }
  }
})

export const createComponentDataAccessor = <
  TComponent extends ComponentSchema<TSchema>,
  TSchema extends IComponentSchema,
  TResult extends IComponentDataAccessor<IComponentInstanceSchema<TSchema, TComponent>>
>(
  componentSchema: TComponent,
  dataView: DataView
): TResult => {
  const schema = componentSchema.schema
  const fieldsOffset = componentSchema.offsets
  const accessor = Object.create(componentDataAccessorPrototype) as IComponentDataAccessor<TSchema>

  Object.defineProperty(accessor, '__index', { enumerable: false, writable: true })

  for (const key in schema) {
    const fieldType = schema[key]
    if (Array.isArray(fieldType)) {
      const [ dataType, length ] = fieldType
      createFixedListAccessor(accessor, key, dataType, dataView, componentSchema.byteLength, fieldsOffset[key], length)
    } else {
      createPrimitiveAccessor(accessor, key, fieldType, dataView, componentSchema.byteLength, fieldsOffset[key])
    }
  }

  return accessor as TResult
}

const createFixedListAccessor = <TSchema extends IComponentSchema>(
  accessor: IComponentDataAccessor<TSchema>,
  key: string,
  dataType: DataType,
  dataView: DataView,
  bytesPerItem: number,
  offset: number,
  arrayLength: number
): void => {
  const buffer = dataView.buffer
  const baseOffset = dataView.byteOffset + offset
  Object.defineProperty(accessor, key, {
    get() {
      return new DataTypeViewConstructor[dataType](buffer, baseOffset + bytesPerItem * this.__index, arrayLength)
    },
    set(value: TypedArray) {
      throw new Error('Only array values mutation is supported')
    },
    enumerable: true
  })
}

const createPrimitiveAccessor = <TSchema extends IComponentSchema>(
  accessor: IComponentDataAccessor<TSchema>,
  key: string,
  dataType: DataType,
  dataView: DataView,
  bytesPerItem: number,
  offset: number
): void => {
  const typedGetter = DataViewHelper.createGetter(dataView, dataType)
  const typedSetter = DataViewHelper.createSetter(dataView, dataType)
  Object.defineProperty(accessor, key, {
    get() {
      return typedGetter(bytesPerItem * this.__index + offset)
    },
    set(v: number) {
      typedSetter(bytesPerItem * this.__index + offset, v)
    },
    enumerable: true
  })
}