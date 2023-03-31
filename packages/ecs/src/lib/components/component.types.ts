import { DataType, TypedArray } from '../allocator/data-type'
import { ComponentSchema } from './component-schema'

export type IFixedList = [ DataType, number ]
export type IComponentSchemaField = DataType | IFixedList
export interface IComponentSchema {
  [key: string]: IComponentSchemaField
}
export type IComponentConstructor<TSchema extends IComponentSchema = IComponentSchema> = new (...args: ConstructorParameters<typeof ComponentSchema>) => ComponentSchema<TSchema>

export type IComponentInstanceSchema<TSchema extends IComponentSchema, TComponent extends ComponentSchema<TSchema>> = ReturnType<TComponent['registerSchema']>

export type IComponentData<TSchema extends IComponentSchema> = {
  [key in keyof TSchema]: TSchema[key] extends IFixedList ? TypedArray : number
}

export type IComponentDataAccessor<TSchema extends IComponentSchema = IComponentSchema> = IComponentData<TSchema> & { __index: number, copy(): IComponentDataAccessor<TSchema> }