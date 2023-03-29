import { DataType } from '../data-type'

export class PrimitiveLazy {
  private _dataView!: DataView

  constructor(
    private readonly _localOffset: number,
    private readonly _dataType = DataType.u32,
    private readonly _byteLength = 8,
  ) {}

  public get value(): number {
    return this._dataView.getUint32(0)
  }

  public set value(value: number) {
    this._dataView.setUint32(0, value)
  }

  public get byteLength(): number {
    return this._byteLength
  }

  public allocate(offset: number, heap: ArrayBuffer): void {
    this._dataView = new DataView(heap, offset + this._localOffset, this._byteLength)
  }

  public transfer(offset: number, heap: ArrayBuffer): void {
    this._dataView = new DataView(heap, offset + this._localOffset, this._byteLength)
  }

}