import { DataType, TypedArray } from './allocator/data-type';

export type ISchemaList = [DataType, number];
export type IStructureDataType = DataType | ISchemaList;

export interface IStructureSchema {
  [key: string]: IStructureDataType;
}

export type IStructureData<T extends IStructureSchema> = {
  [P in keyof T]: T[P] extends DataType ? number : Array<number>;
};

export type IStructureValue = number | Array<number>;
