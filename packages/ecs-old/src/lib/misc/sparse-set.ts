import { DataType, DataTypeSize } from '../allocator/data-type';
import { EntityRef } from '../entities/types';
import { Heap } from '../heap';
import { Int } from '../types';
import { HeapItemAccessor } from './heap-item-accessor';

export class SparseSet {
  private _sparse!: Uint32Array;
  private _dense!: Uint32Array;
  private _n!: HeapItemAccessor;

  constructor(
    private readonly _entityPoolSize: Int,
    private readonly _byteOffset: Int
  ) {}

  public get byteLength(): number {
    return (
      this._entityPoolSize * Uint32Array.BYTES_PER_ELEMENT * 2 +
      HeapItemAccessor.byteLength
    );
  }

  public getNextId(): number {
    return this._n.value;
  }

  public allocate(heap: Heap) {
    const arrayByteLength = this._entityPoolSize * DataTypeSize[DataType.u32];
    this._n = new HeapItemAccessor(DataType.u32, this._byteOffset, heap);
    this._sparse = heap.createDataPtr(
      DataType.u32,
      this._byteOffset + HeapItemAccessor.byteLength
    ) as Uint32Array;
    this._dense = heap.createDataPtr(
      DataType.u32,
      this._byteOffset + HeapItemAccessor.byteLength + arrayByteLength
    ) as Uint32Array;
  }

  public set(entityRef: EntityRef): void {
    if (this.has(entityRef)) {
      console.log('SparseSet.set', entityRef, 'already exists');
      console.log(this);
      console.log(new Error().stack);
      return;
    }
    const n = this._n.value;
    this._dense[n] = entityRef;
    this._sparse[entityRef] = n;
    this._n.value = n + 1;
    console.log('SparseSet.set', entityRef);
  }

  public has(value: number) {
    return (
      this._sparse[value] < this._n.value &&
      this._dense[this._sparse[value]] === value
    );
  }

  public remove(value: number) {
    if (!this.has(value)) return;

    console.log('SparseSet.remove', value);

    const n = this._n.value;
    const index = this._sparse[value];
    const lastIndex = n - 1;
    const lastValue = this._dense[lastIndex];

    this._sparse[lastValue] = index;
    this._dense[index] = lastValue;

    this._n.value = n - 1;
  }

  // public remove(entityRef: EntityRef): void {
  //   const n = this._n.value
  //   const index = this._sparse[entityRef]
  //   const last = this._dense[n - 1]
  //   this._dense[index] = last
  //   this._sparse[last] = index
  //   this._n.value = n - 1
  // }
  //
  // public has(entityRef: EntityRef): boolean {
  //   const n = this._n.value
  //   const index = this._sparse[entityRef]
  //   // return index !== 0 && this._dense[index] < n
  //
  //   return index < n && this._dense[index] === entityRef
  // }

  public clear(): void {
    this._n.value = 0;
  }
}
