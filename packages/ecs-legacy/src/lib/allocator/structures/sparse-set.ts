import { Allocator } from '@p228/ecs-legacy';
import { Logger } from '../../misc/logger';
import {
  DataType,
  DataTypeSize,
  DataTypeViewConstructor,
  TypedArray,
} from '../data-type';
import { IAllocatorStructure } from './allocator-structure.interface';

export class SparseSet implements IAllocatorStructure {
  private _heapView!: TypedArray;
  private _byteOffset: number;
  private _byteLength: number;

  constructor(
    public readonly dataType: DataType,
    private _size: number,
    private readonly _allocator: Allocator
  ) {
    this._byteLength = this.calculateByteLength();
    this._byteOffset = this._allocator.allocate(this._byteLength, false);
    this._heapView = new DataTypeViewConstructor[this.dataType](
      this._allocator.heap,
      this._byteOffset,
      this._size * 2
    );
  }

  private free(): void {
    this._heapView = null as never;
    this._allocator.free(this._byteOffset);
  }

  public get byteOffset(): number {
    return this._byteOffset;
  }

  public get byteLength(): number {
    return this._byteLength;
  }

  public add(index: number, value: number): void {
    if (index === 0) throw new Error('SparseSet 0 index is not supported');
    if (index >= this._size) this.reallocate(this._size * 2);

    const sparseIndex = index * 2;
    const denseIndex = sparseIndex + 1;

    this._heapView[sparseIndex] = value;
    this._heapView[denseIndex] = index;
  }

  /**
   * Returns the value of the element at the specified index. Zero is returned if the element is not present.
   * @param index
   */
  public get(index: number): number {
    return this._heapView[index * 2];
  }

  public has(index: number): boolean {
    return this._heapView[index * 2] !== 0;
  }

  public remove(index: number): void {
    const sparseIndex = index * 2;
    const denseIndex = sparseIndex + 1;

    this._heapView[sparseIndex] = 0;
    this._heapView[denseIndex] = 0;
  }

  public static calculateByteLength(dataType: DataType, size: number): number {
    return DataTypeSize[dataType] * size * 2;
  }

  private calculateByteLength(): number {
    return SparseSet.calculateByteLength(this.dataType, this._size);
  }

  private reallocate(newSize: number) {
    const newByteLength = SparseSet.calculateByteLength(this.dataType, newSize);
    const newByteOffset = this._allocator.allocate(newByteLength, false);
    const newHeapView = new DataTypeViewConstructor[this.dataType](
      this._allocator.heap,
      newByteOffset,
      newSize * 2
    );
    newHeapView.set(this._heapView);

    this.free();

    Logger.log(`SparseSet reallocated from ${this._size} to ${newSize}`);

    this._size = newSize;
    this._heapView = newHeapView;
    this._byteOffset = newByteOffset;
    this._byteLength = newByteLength;
  }

  public transfer(byteOffset: number, heap: ArrayBuffer): void {
    this._byteOffset = byteOffset;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      byteOffset,
      this._size * 2
    );
  }
}
