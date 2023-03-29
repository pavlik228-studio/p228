import { DataType, TypedArray } from '../allocator/data-type';
import { Heap } from '../heap';

/**
 * @internal - This class is used to access a single item in the heap (ArrayBuffer).
 */
export class HeapItemAccessor {
  public static readonly byteLength = 8;
  private _store!: TypedArray;
  constructor(
    public readonly dataType: DataType,
    private _byteOffset: number,
    private readonly _heap: Heap
  ) {
    this.allocate();
  }

  public allocate(): void {
    this._store = this._heap.createDataPtr(this.dataType, this._byteOffset, 1);
  }

  public get value(): number {
    return this._store[0];
  }

  public set value(value: number) {
    this._store[0] = value;
  }
}
