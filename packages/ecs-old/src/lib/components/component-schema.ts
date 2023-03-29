import { DataType } from '../allocator/data-type';

export interface IComponentSchemaDefinition {
  [key: string]: DataType;
}
