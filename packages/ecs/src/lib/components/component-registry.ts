import { DataTypeViewConstructor } from '../allocator/data-type'
import { Allocator } from '../allocator/allocator'
import { ECSConfig } from '../ecs-config'
import { IComponent, IComponentInternal, IComponentSchema } from './component.types'
import { FixedListAccessor } from './fixed-list-accessor'

export class ComponentRegistry {
  public readonly byteLength: number
  public readonly registrySize: number
  private readonly _nextComponentIdx: number
  constructor(
    private readonly _config: ECSConfig,
    private readonly _components: Array<IComponentInternal>
  ) {
    this.byteLength = 0
    this.registrySize = 0
    this._nextComponentIdx = 0

    for (const component of _components) {
      if (this._nextComponentIdx >= 32) throw new Error('Too many components')
      component._ID = Math.pow(2, this._nextComponentIdx++)
      this.byteLength += component._BYTES_PER_ELEMENT
      this.registrySize += component._FIELDS_COUNT
    }
  }

  public initialize(allocator: Allocator): void {
    for (const component of (this._components as Array<IComponent<IComponentSchema>>)) {
      const byteLength = component._BYTES_PER_ELEMENT * (component._LIMIT ?? this._config.entityPoolSize)
      component._PTR = allocator.allocate(byteLength)
      component._BYTE_LENGTH = byteLength
      const schema = component._SCHEMA
      for (const key in schema) {
        const schemaField = schema[key]
        if (Array.isArray(schemaField)) {
          const [ dataType, size ] = schemaField
          const typedArray = new (DataTypeViewConstructor[dataType])(allocator.heap, component._PTR, size * this._config.entityPoolSize)
          component[key] = new FixedListAccessor(typedArray, size)
        } else {
          component[key] = new DataTypeViewConstructor[schemaField](allocator.heap, component._PTR, this._config.entityPoolSize)
        }
      }
    }
  }
}