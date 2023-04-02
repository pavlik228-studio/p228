import { DataType, TypedArray } from '../allocator/data-type'

export type FixedArray = [ DataType, number ]

export type IComponentSchemaField = DataType | FixedArray

export interface IComponentSchema {
  [key: string]: IComponentSchemaField
}

export interface IComponentInternal<TSchema extends IComponentSchema = IComponentSchema> {
  __ID: number
  __KEYS: string[]
  __OFFSETS: number[]
  __BYTE_LENGTH: number
  __SCHEMA: TSchema
}

export type IComponentDataAccessor<TSchema extends IComponentSchema> = {
  [P in keyof TSchema]: TSchema[P] extends FixedArray ? TypedArray : number
}

export type IComponentDataAccessorInternal<TSchema extends IComponentSchema> = IComponentDataAccessor<TSchema> & {
  __INDEX: number
}