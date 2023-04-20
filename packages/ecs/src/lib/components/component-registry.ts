import { Logger } from '@p228/ecs'
import { DataTypeSize, DataTypeViewConstructor } from '../allocator/data-type'
import { Allocator } from '../allocator/allocator'
import { ECSConfig } from '../ecs-config'
import {
  IComponent,
  IComponentInternal,
  IComponentSchema,
  ISingletonComponent,
  ISingletonComponentInternal,
} from './component.types'
import { FixedListAccessor } from './fixed-list-accessor'

export class ComponentRegistry {
  public readonly byteLength: number
  public readonly registrySize: number
  private readonly _nextComponentIdx: number
  constructor(
    private readonly _config: ECSConfig,
    private readonly _components: Array<IComponentInternal>,
    private readonly _singletonComponents: Array<ISingletonComponentInternal>,
  ) {
    this.byteLength = 0
    this.registrySize = 0
    this._nextComponentIdx = 0

    for (const component of _components) {
      if (this._nextComponentIdx >= 32) throw new Error('Too many components')
      component._ID = Math.pow(2, this._nextComponentIdx++)
      this.byteLength += component._BYTES_PER_ELEMENT * (component._LIMIT ?? this._config.entityPoolSize)
      this.registrySize += component._FIELDS_COUNT
    }

    for (const component of _singletonComponents) {
      this.byteLength += component._BYTES_PER_ELEMENT
      this.registrySize += component._FIELDS_COUNT
    }
  }

  public initialize(allocator: Allocator): void {
    for (const component of (this._components as Array<IComponent<IComponentSchema>>)) {
      const byteLength = component._BYTES_PER_ELEMENT * (component._LIMIT ?? this._config.entityPoolSize)
      component._PTR = allocator.allocate(byteLength)
      component._BYTE_LENGTH = byteLength
      Logger.log(`Allocated component at ${component._PTR} (${byteLength} bytes)`)
    }

    for (const component of (this._singletonComponents as Array<ISingletonComponent<IComponentSchema>>)) {
      const byteLength = component._BYTES_PER_ELEMENT
      component._PTR = allocator.allocate(byteLength)
      component._BYTE_LENGTH = byteLength
      Logger.log(`Allocated SingletonComponent at ${component._PTR} (${byteLength} bytes)`)
    }

    this.allocateComponentsInternal(allocator.heap)

    allocator.onTransfer(this.allocateComponentsInternal)
  }

  private allocateComponentsInternal = (heap: ArrayBuffer): void => {
    for (const component of (this._components as Array<IComponent<IComponentSchema>>)) {
      const schema = component._SCHEMA
      let offset = 0
      for (const key in schema) {
        const schemaField = schema[key]
        if (Array.isArray(schemaField)) {
          const [ dataType, size ] = schemaField
          const typedArray = new (DataTypeViewConstructor[dataType])(heap, component._PTR + offset, size * this._config.entityPoolSize)
          component[key] = new FixedListAccessor(typedArray, size)
          offset += DataTypeSize[dataType] * size * this._config.entityPoolSize
        } else {
          component[key] = new DataTypeViewConstructor[schemaField](heap, component._PTR + offset, this._config.entityPoolSize)
          offset += DataTypeSize[schemaField] * this._config.entityPoolSize
        }
      }
    }

    for (const component of (this._singletonComponents as Array<ISingletonComponent<IComponentSchema>>)) {
      const schema = component._SCHEMA
      const raw = {} as typeof component.raw
      let offset = 0
      for (const key in schema) {
        const schemaField = schema[key]
        if (Array.isArray(schemaField)) {
          const [ dataType, size ] = schemaField
          raw[key] = new DataTypeViewConstructor[dataType](heap, component._PTR + offset, size)
          offset += DataTypeSize[dataType] * size
        } else {
          raw[key] = new DataTypeViewConstructor[schemaField](heap, component._PTR + offset, 1)
          offset += Math.ceil(DataTypeSize[schemaField] / 8) * 8
        }
      }
      component.raw = raw
      component.data = component._ACCESSOR(raw)
    }
  }
}