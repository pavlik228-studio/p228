import {
  DataType,
  DataTypeSize,
  DataTypeViewConstructor,
  TypedArray,
} from '../data-type';
import { HeapPrimitiveAccessor } from '../heap-primitive-accessor';
import { IAllocatorStructure } from './allocator-structure.interface';

export class HeapTuples<T extends object> implements IAllocatorStructure {
  private _heapView!: TypedArray;
  private readonly _keys: (keyof T)[];
  private readonly _dataBuffer: T;
  private readonly _byteLength: number;

  constructor(
    dataBuffer: T,
    public readonly dataType: DataType,
    private _size: number
  ) {
    this._keys = Object.keys(dataBuffer)
      .filter((key) => dataBuffer.hasOwnProperty(key))
      .sort() as (keyof T)[];
    this._byteLength = this.calculateByteLength();

    this._dataBuffer = {} as T;
    for (const key of this._keys) {
      this._dataBuffer[key] = 0 as never;
    }
  }

  public get size(): number {
    return this._size;
  }

  private _length!: HeapPrimitiveAccessor;

  public get length(): number {
    return this._length.value;
  }

  public get byteLength(): number {
    return this._byteLength;
  }

  private _byteOffset = 0;

  public get byteOffset(): number {
    return this._byteOffset;
  }

  public static calculateByteLength(
    dataType: DataType,
    size: number,
    keys: number
  ): number {
    return (
      keys * DataTypeSize[dataType] * size + HeapPrimitiveAccessor.byteLength
    );
  }

  public allocate(byteOffset: number, heap: ArrayBuffer): void {
    this._byteOffset = byteOffset;
    this._length = new HeapPrimitiveAccessor(DataType.u32);
    this._length.allocate(
      this._byteOffset,
      HeapPrimitiveAccessor.byteLength,
      heap
    );
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      this._byteOffset + HeapPrimitiveAccessor.byteLength,
      this._size * this._keys.length
    );
  }

  public move(byteOffset: number, heap: ArrayBuffer): void {
    const length = this._length.value;
    this._length.free();
    this._length.allocate(byteOffset, HeapPrimitiveAccessor.byteLength, heap);
    this._length.value = length;

    const heapView = this._heapView;
    this._byteOffset = byteOffset;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      this._byteOffset + HeapPrimitiveAccessor.byteLength,
      this._size * this._keys.length
    );
    this._heapView.set(heapView);
  }

  public add(values: T): number {
    const length = this._length.value;
    const heapView = this._heapView;

    if (length >= this._size) {
      throw new Error('Heap is full');
    }

    let index = length * this._keys.length;

    for (const key of this._keys) {
      heapView[index++] = values[key] as never;
    }

    this._length.value = length + 1;

    return length;
  }

  public set(index: number, values: T): void {
    if (index >= this._size) throw new Error('Index out of bounds');

    const heapView = this._heapView;
    let i = index * this._keys.length;

    for (const key of this._keys) {
      heapView[i++] = values[key] as never;
    }
  }

  public get(index: number): T {
    if (index >= this._length.value) throw new Error('Index out of bounds');

    const heapView = this._heapView;
    const keys = this._keys;
    const result = this._dataBuffer;
    let i = index * keys.length;

    for (const key of this._keys) {
      result[key as keyof T] = heapView[i++] as never;
    }

    return result;
  }

  /**
   * @param value - The value to search for.
   * @param dataIndex - The index of the data key to search for the value in. Source structure keys are sorted alphabetically.
   */
  public indexOf(value: number, dataIndex = 0): number {
    const keys = this._keys;
    const heapView = this._heapView;
    const length = this._length.value;
    const key = keys[dataIndex];
    const keyIndex = keys.indexOf(key);
    const keyLength = keys.length;
    let i = keyIndex;

    for (let j = 0; j < length; j++) {
      if (heapView[i] === value) {
        return j;
      }

      i += keyLength;
    }

    return -1;
  }

  /**
   * @param predicate - The predicate to search for.
   * @param dataIndex - The index of the data key to search for the value in. Source structure keys are sorted alphabetically.
   */
  public find(
    predicate: (value: number) => boolean,
    dataIndex = 0
  ): T | undefined {
    const keys = this._keys;
    const heapView = this._heapView;
    const length = this._length.value;
    const key = keys[dataIndex];
    const keyIndex = keys.indexOf(key);
    const keyLength = keys.length;
    let i = keyIndex;

    for (let j = 0; j < length; j++) {
      if (predicate(heapView[i])) {
        return this.get(j);
      }

      i += keyLength;
    }

    return undefined;
  }

  public findIndex(
    predicate: (value: number) => boolean,
    dataIndex = 0
  ): number {
    const keys = this._keys;
    const heapView = this._heapView;
    const length = this._length.value;
    const key = keys[dataIndex];
    const keyIndex = keys.indexOf(key);
    const keyLength = keys.length;
    let i = keyIndex;

    for (let j = 0; j < length; j++) {
      if (predicate(heapView[i])) {
        return j;
      }

      i += keyLength;
    }

    return -1;
  }

  public insertBefore(index: number, values: T): void {
    const heapView = this._heapView;
    const keys = this._keys;
    const length = this._length.value;

    if (length >= this._size) throw new Error('Heap is full');

    const offset = keys.length;

    for (let i = length * keys.length - 1; i >= index; i--) {
      heapView[i + offset] = heapView[i];
    }

    this.set(index, values);
    this._length.value = length + 1;
  }

  public remove(index: number): void {
    const heapView = this._heapView;
    const keys = this._keys;
    const length = this._length.value;

    if (index >= length) throw new Error('Index out of bounds');

    const offset = keys.length;
    const startIndex = index * keys.length;
    const endIndex = (length - 1) * keys.length;

    for (let i = startIndex; i < endIndex; i++) {
      heapView[i] = heapView[i + offset];
    }

    this._length.value = length - 1;
  }

  public *[Symbol.iterator](): IterableIterator<T> {
    const length = this._length.value;

    for (let i = 0; i < length; i++) {
      yield this.get(i);
    }
  }

  public toJSON(): T[] {
    const result: T[] = [];
    const length = this._length.value;

    for (let i = 0; i < length; i++) result.push({ ...this.get(i) });

    return result;
  }

  private calculateByteLength(): number {
    return HeapTuples.calculateByteLength(
      this.dataType,
      this._size,
      this._keys.length
    );
  }
}
