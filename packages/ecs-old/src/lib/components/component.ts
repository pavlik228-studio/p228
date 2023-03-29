import { Heap } from '../heap';
import { Int } from '../types';
import { IComponentSchemaDefinition } from './component-schema';
import { DataTypeSize } from '../allocator/data-type';
import { ComponentDataPtr } from './types';

export abstract class Component<
  TSchema extends IComponentSchemaDefinition = IComponentSchemaDefinition
> {
  public readonly id: Int;
  private _ptr!: ComponentDataPtr<TSchema>;
  private readonly _byteLength: number;

  public get ptr(): ComponentDataPtr<TSchema> {
    return this._ptr;
  }
  public get byteLength(): number {
    return this._byteLength;
  }

  protected abstract registerSchema(): TSchema;

  constructor(private readonly _heap: Heap, private readonly _byteOffset: Int) {
    this.id = this._heap.reserveComponentId();
    this._byteLength = this.calculateByteLength(this._heap.entityPoolSize);
  }

  public createDataPtr(): void {
    this._ptr = {} as ComponentDataPtr<TSchema>;
    const schema = this.registerSchema();
    const keys = Object.keys(schema).sort((a, b) => (a < b ? -1 : 1));
    let byteOffset = this._byteOffset;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof TSchema;
      byteOffset += byteOffset % DataTypeSize[schema[key]];
      this._ptr[key] = this._heap.createDataPtr(schema[key], byteOffset);
      byteOffset += DataTypeSize[schema[key]] * this._heap.entityPoolSize;
    }
  }

  private calculateByteLength(entityCount: Int): number {
    let byteLength = 0;
    const schema = this.registerSchema();
    const keys = Object.keys(schema).sort((a, b) => (a < b ? -1 : 1));

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof TSchema;
      byteLength += byteLength % DataTypeSize[schema[key]];
      byteLength += DataTypeSize[schema[key]] * entityCount;
    }

    return byteLength;
  }
}

export interface IComponentConstructor<
  TSchema extends IComponentSchemaDefinition = IComponentSchemaDefinition
> {
  new (heap: Heap, byteOffset: Int): Component<TSchema>;
}
