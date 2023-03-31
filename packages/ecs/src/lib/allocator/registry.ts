import { IPtrAccessor } from './allocator.types'
import { DataType, DataTypeSize } from './data-type'

export class Registry {
  private _dataView: DataView
  public static readonly registryOffset = DataTypeSize[DataType.u32]

  public static calculateSize(registrySize: number): number {
    return Registry.registryOffset + registrySize * DataTypeSize[DataType.u32]
  }

  constructor(
    private _heap: ArrayBuffer,
    private _registrySize: number,
    private _offset = 0
  ) {
    this._dataView = new DataView(this._heap, this._offset, this._registrySize * DataTypeSize[DataType.u32])
  }

  public create(): IPtrAccessor {
    const registry = this
    const id = this.nextId()
    const offset = Registry.registryOffset + id * DataTypeSize[DataType.u32]

    if (id >= this._registrySize) throw new Error('Registry is full')

    return {
      _id: id,
      get value() {
        return registry._dataView.getUint32(offset)
      },
      set value(value) {
        registry._dataView.setUint32(offset, value)
      }
    }
  }

  private nextId(): number {
    const id = this._dataView.getUint32(0)
    this._dataView.setUint32(0, id + 1)

    return id
  }

  public transfer(heap: ArrayBuffer): void {
    this._heap = heap
    this._dataView = new DataView(this._heap, this._offset, this._registrySize * DataTypeSize[DataType.u32])
  }
}