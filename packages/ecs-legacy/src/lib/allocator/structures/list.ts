import { Allocator } from '../allocator';
import { RefAccessor } from '../ref-accessor';
import {
  DataType,
  DataTypeSize,
  DataTypeViewConstructor,
  TypedArray,
} from '../data-type';
import { HeapPrimitiveAccessor } from '../heap-primitive-accessor';
import { IAllocatorStructure } from './allocator-structure.interface';

export class List implements IAllocatorStructure {
  private _size!: HeapPrimitiveAccessor;
  private _length!: HeapPrimitiveAccessor;
  private _heapView!: TypedArray;
  private readonly _ref!: RefAccessor;

  constructor(
    public readonly dataType: DataType,
    initialSize: number,
    private readonly _allocator: Allocator
  ) {
    this._ref = this._allocator.createRef();
    this._size = new HeapPrimitiveAccessor(DataType.u32);
    this._length = new HeapPrimitiveAccessor(DataType.u32);
    this.allocate(initialSize);
  }

  public get ref(): RefAccessor {
    return this._ref;
  }

  public get size(): number {
    return this._size.value;
  }

  public get length(): number {
    return this._length.value;
  }

  public get byteLength(): number {
    return List.calculateByteLength(this._size.value, this.dataType);
  }

  public static calculateByteLength(
    initialSize: number,
    dataType: DataType
  ): number {
    return (
      HeapPrimitiveAccessor.byteLength * 2 +
      DataTypeSize[dataType] * initialSize
    );
  }

  public add(value: number): number {
    const length = this._length.value;
    const size = this._size.value;

    if (length >= size) this.resize(size * 2);

    this._heapView[length] = value;
    this._length.value = length + 1;

    return length;
  }

  public get(index: number): number | undefined {
    if (index >= this._length.value) return undefined;
    return this._heapView[index];
  }

  public set(index: number, value: number): void {
    if (index >= this._length.value) return;
    this._heapView[index] = value;
  }

  public remove(index: number): void {
    const length = this._length.value;

    if (index >= length) return;

    this._heapView.copyWithin(index, index + 1, length);
    this._length.value = length - 1;
  }

  public shift(): number | undefined {
    const length = this._length.value;

    if (length === 0) return undefined;

    const value = this._heapView[0];
    this._heapView.copyWithin(0, 1, length);
    this._length.value = length - 1;

    return value;
  }

  public pop(): number | undefined {
    const length = this._length.value;

    if (length === 0) return undefined;

    this._length.value = length - 1;

    return this._heapView[length - 1];
  }

  public clear(): void {
    this._length.value = 0;
  }

  public transfer(heap: ArrayBuffer) {
    const ref = this._ref.value;
    let offset = 0;
    this._size.transfer(ref, heap);
    offset += HeapPrimitiveAccessor.byteLength;
    this._length.transfer(ref + offset, heap);
    offset += HeapPrimitiveAccessor.byteLength;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      ref + offset,
      this._size.value
    );
  }

  private resize(newSize: number): void {
    const oldLength = this._size.value;
    const oldHeapView = this._heapView;

    this.allocate(newSize);
    oldHeapView.set(this._heapView);
    this._length.value = oldLength;
  }

  private allocate(initialSize: number): void {
    const byteLength = List.calculateByteLength(initialSize, this.dataType);
    const ref = (this._ref.value = this._allocator.allocate(byteLength));
    let offset = 0;
    this._size.allocate(
      ref + offset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    this._size.value = initialSize;
    offset += HeapPrimitiveAccessor.byteLength;
    this._length.allocate(
      ref + offset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    offset += HeapPrimitiveAccessor.byteLength;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      this._allocator.heap,
      ref + offset,
      initialSize
    );
  }
}
