import { IComponentSchema, ISingletonComponent, ISingletonComponentAccessor } from './component.types'
import { defineComponent } from './define-component'

export function defineSingletonComponent<TSchema extends IComponentSchema>(schema: TSchema, createAccessor: ISingletonComponentAccessor<TSchema>): ISingletonComponent<TSchema> {
  const component = defineComponent(schema) as unknown as ISingletonComponent<TSchema>
  component._LIMIT = 1
  component._ACCESSOR = createAccessor
  return component
}