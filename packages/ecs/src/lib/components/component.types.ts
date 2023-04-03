import { DataType, TypedArray } from '../allocator/data-type'
export type IFixedList = [ DataType, number ]
export type IComponentSchemaField = DataType | IFixedList
export interface IComponentSchema {
  [key: string]: IComponentSchemaField
}

export interface IComponentInternal {
  _ID: number,
  _PTR: number
  _LIMIT: number,
  _BYTE_LENGTH: number,
  _FIELDS_COUNT: number,
  _BYTES_PER_ELEMENT: number,
  _SCHEMA: IComponentSchema,
}

export interface IDataFieldAccessor<T> {
  get(index: number): T
}

export type IComponentFieldData<T extends IComponentSchemaField> = T extends DataType ? TypedArray : T extends IFixedList ? IDataFieldAccessor<TypedArray> : never

export type IComponent<T extends IComponentSchema> = {
  [K in keyof T]: IComponentFieldData<T[K]>
} & IComponentInternal

export type IComponentLike = {
  [key: string]: TypedArray | IDataFieldAccessor<TypedArray>
} & IComponentInternal