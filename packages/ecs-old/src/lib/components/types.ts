import { IComponentSchemaDefinition } from './component-schema';
import { TypedArray } from '../allocator/data-type';

export type ComponentDataPtr<TSchema = IComponentSchemaDefinition> = {
  [K in keyof TSchema]: TypedArray;
};
