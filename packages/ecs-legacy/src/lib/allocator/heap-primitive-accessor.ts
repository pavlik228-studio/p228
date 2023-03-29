import { DataType, DataTypeViewConstructor, TypedArray } from './data-type';

export class HeapPrimitiveAccessor {
  public readonly ref = 0;
  public static readonly byteLength = 8;
  public readonly byteLength = HeapPrimitiveAccessor.byteLength;
  private _heapView!: TypedArray;

  constructor(public readonly dataType: DataType) {}

  public transfer(byteOffset: number, heap: ArrayBuffer): void {
    this._byteOffset = byteOffset;
    this._heapView = new DataTypeViewConstructor[this.dataType](
      heap,
      byteOffset,
      1
    );
  }

  private _byteOffset = 0;

  public get byteOffset(): number {
    return this._byteOffset;
  }

  public get value(): number {
    return this._heapView[0];
  }

  public set value(value: number) {
    this._heapView[0] = value;
  }

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

  public free(): void {
    this._byteOffset = 0;
    this._heapView = null as never;
  }
}
