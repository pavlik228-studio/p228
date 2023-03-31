import { DataType, DataTypeSize } from '../allocator/data-type'
import { IComponentSchema } from './component.types'

export abstract class ComponentSchema<TSchema extends IComponentSchema = IComponentSchema> {
  public readonly schema: TSchema
  public readonly offsets: { [key in keyof TSchema]: number }
  public readonly keys: Array<keyof TSchema>

  constructor(
    public readonly id: number,
  ) {
    this.schema = this.registerSchema()
    this.keys = Object.keys(this.schema).sort() as Array<keyof TSchema>
    this.offsets = this.calculateOffsets()
  }

  private _byteLength!: number

  public get byteLength(): number {
    return this._byteLength
  }

  public abstract registerSchema(): TSchema

  private calculateOffsets(): { [key in keyof TSchema]: number } {
    const offsets = {} as { [key in keyof TSchema]: number }
    let offset = 0

    for (const key of this.keys) {
      offsets[key] = offset

      const dataType = this.schema[key]
      if (Array.isArray(dataType)) {
        const [ type, length ] = dataType
        offset += DataTypeSize[type] * length
      } else {
        offset += DataTypeSize[dataType as DataType]
      }
    }

    this._byteLength = offset

    return offsets
  }
}