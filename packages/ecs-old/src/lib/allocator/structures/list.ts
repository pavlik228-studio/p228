import { Allocator } from '../allocator';
import { DataType, DataTypeViewConstructor, TypedArray } from '../data-type';
import { HeapPrimitiveAccessor } from '../heap-primitive-accessor';
import { IAllocatorStructure } from './allocator-structure.interface';

export class List implements IAllocatorStructure {
  private _byteOffset = 0;
  private _byteLength = 0;
  private _heapView!: TypedArray;
  private _length!: HeapPrimitiveAccessor;

  public get byteOffset(): number {
    return this._byteOffset;
  }

  public get byteLength(): number {
    return this._byteLength;
  }

  public get length(): number {
    return this._length.value;
  }

  public get size(): number {
    return this._size;
  }

  constructor(
    public readonly dataType: DataType,
    private _size: number,
    private readonly _allocator: Allocator
  ) {
    this._byteLength = this.calculateByteLength();
    this._byteOffset = this._allocator.allocate(this._byteLength);
    this._length = new HeapPrimitiveAccessor(DataType.u32);
    this._length.allocate(
      this._byteOffset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    const heap = this._allocator.heap;
    if (this._byteOffset + this._byteLength > heap.byteLength) debugger;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      this._byteOffset + HeapPrimitiveAccessor.byteLength,
      this._size
    );
  }

  public get(index: number): number | undefined {
    if (index >= this._length.value) return undefined;
    return this._heapView[index];
  }

  public add(value: number): number {
    const length = this._length.value;

    if (length >= this._size) this.reallocate(this._size * 2);

    this._heapView[length] = value;
    this._length.value = length + 1;

    return length;
  }

  public remove(index: number): void {
    const length = this._length.value;
    if (index >= length) return;
    this._heapView[index] = this._heapView[length - 1];
    this._length.value = length - 1;
  }

  public free(): void {
    this._allocator.free(this._byteOffset);
    this._length.free();
    this._byteOffset = undefined as never;
    this._byteLength = undefined as never;
    this._heapView = undefined as never;
  }

  private reallocate(newSize: number): void {
    const newByteLength =
      newSize * DataTypeViewConstructor[this.dataType].BYTES_PER_ELEMENT +
      HeapPrimitiveAccessor.byteLength;
    const newByteOffset = this._allocator.allocate(newByteLength);

    const newLength = new HeapPrimitiveAccessor(DataType.u32);
    newLength.allocate(
      newByteOffset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    newLength.value = this._length.value;

    const newHeap = new DataTypeViewConstructor[this.dataType](
      this._allocator.heap,
      newByteOffset + HeapPrimitiveAccessor.byteLength,
      newSize
    );
    newHeap.set(this._heapView);

    this.free();

    this._length = newLength;
    this._heapView = newHeap;
    this._size = newSize;
    this._byteLength = newByteLength;
    this._byteOffset = newByteOffset;
  }

  private calculateByteLength(): number {
    return (
      this._size * DataTypeViewConstructor[this.dataType].BYTES_PER_ELEMENT +
      HeapPrimitiveAccessor.byteLength
    );
  }
}
