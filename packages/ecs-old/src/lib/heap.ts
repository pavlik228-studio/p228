import type { IComponentConstructor, Component } from './components/component';
import { IComponentSchemaDefinition } from './components/component-schema';
import {
  DataType,
  DataTypeViewConstructor,
  TypedArray,
} from './allocator/data-type';
import { EntityManager } from './entities/entity-manager';
import { SparseSet } from './misc/sparse-set';
import { Int } from './types';

export class Heap {
  public readonly entitiesSparseSet: SparseSet;
  private _componentNextId: Int = 0;
  private _byteOffset: Int = 0;
  private _arrayBuffer!: ArrayBuffer;

  constructor(
    public readonly entityPoolSize: number,
    private readonly _entityManager: EntityManager,
    componentConstructors: Array<IComponentConstructor>
  ) {
    const componentsRegistry = this._entityManager.componentsRegistry;

    for (const ComponentConstructor of componentConstructors) {
      const byteLength = this._entityManager.registerComponent(
        ComponentConstructor,
        this,
        this._byteOffset
      );
      this._byteOffset += byteLength;
    }

    for (const componentConstructor of componentConstructors) {
      this._byteOffset += this._entityManager.registerComponentSparseSet(
        componentConstructor,
        this.entityPoolSize,
        this._byteOffset
      );
    }

    this.entitiesSparseSet = new SparseSet(
      this.entityPoolSize,
      this._byteOffset
    );
    this._byteOffset += this.entitiesSparseSet.byteLength;

    this._arrayBuffer = new ArrayBuffer(this._byteOffset);
    console.log('Heap size:', this._byteOffset);

    for (const component of componentsRegistry) {
      component.createDataPtr();
    }

    for (const sparseSet of this._entityManager.sparseSetRegistry.values()) {
      sparseSet.allocate(this);
    }

    this.entitiesSparseSet.allocate(this);
  }

  public reserveComponentId(): number {
    return this._componentNextId++;
  }

  public getComponentRef<TSchema extends IComponentSchemaDefinition>(
    componentConstructor: IComponentConstructor<TSchema>
  ): Component<TSchema> {
    return this._entityManager.componentsRegistry.getComponent(
      componentConstructor
    );
  }

  public createDataPtr(
    dataType: DataType,
    byteOffset: number,
    length = this.entityPoolSize
  ): TypedArray {
    return new DataTypeViewConstructor[dataType](
      this._arrayBuffer,
      byteOffset,
      length
    );
  }

  public createSnapshot(): ArrayBuffer {
    return this._arrayBuffer.slice(0);
  }

  public applySnapshot(snapshot: ArrayBuffer): void {
    const arrayBuffer = new ArrayBuffer(this._byteOffset);
    const snapshotU8 = new Uint8Array(snapshot);
    const arrayBufferU8 = new Uint8Array(arrayBuffer);

    for (let i = 0; i < this._byteOffset; i++) {
      arrayBufferU8[i] = snapshotU8[i];
    }

    this._arrayBuffer = arrayBuffer;

    for (const component of this._entityManager.componentsRegistry) {
      component.createDataPtr();
    }

    // for (const sparseSet of this._entityManager.sparseSetRegistry.values()) {
    //   sparseSet.allocate(this)
    // }
  }
}
