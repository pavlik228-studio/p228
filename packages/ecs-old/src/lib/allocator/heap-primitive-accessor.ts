import { DataType, DataTypeViewConstructor, TypedArray } from './data-type';
import { IAllocatorStructure } from './structures/allocator-structure.interface';

export class HeapPrimitiveAccessor implements IAllocatorStructure {
  public static readonly byteLength = 8;
  public readonly byteLength = HeapPrimitiveAccessor.byteLength;
  private _byteOffset = 0;
  private _heapView!: TypedArray;

  public get byteOffset(): number {
    return this._byteOffset;
  }

  constructor(public readonly dataType: DataType) {}

  public allocate(
    byteOffset: number,
    byteLength: number,
    heap: ArrayBuffer
  ): void {
    this._byteOffset = byteOffset;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      byteOffset,
      1
    );
  }

  public get value(): number {
    return this._heapView[0];
  }

  public set value(value: number) {
    this._heapView[0] = value;
  }

  public free(): void {
    this._byteOffset = 0;
    this._heapView = null as never;
  }
}
