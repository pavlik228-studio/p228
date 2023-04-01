import { Allocator } from '../allocator/allocator'
import { ComponentCollection } from './component-collection'
import { ComponentSchema } from './component-schema'
import { IComponentConstructor, IComponentDataAccessor, IComponentSchema } from './component.types'

export class ComponentRegistry {
  public readonly byteLength = 0
  public readonly ptrPerComponent = 3
  public readonly componentIds = new Map<IComponentConstructor, number>()
  private readonly _registry = new Map<IComponentConstructor, ComponentSchema>()
  private readonly _componentData = new Map<IComponentConstructor, ComponentCollection>()
  private readonly _componentIdData = new Map<number, ComponentCollection>()

  constructor(
    private readonly _componentConstructors: IComponentConstructor[],
  ) {
    let idx = 0
    for (const Component of _componentConstructors) {
      const component = new Component(Math.pow(2, idx++))
      this._registry.set(Component, component)
      this.componentIds.set(Component, component.id)
      this.byteLength += component.byteLength
    }
  }

  public get count(): number {
    return this._registry.size
  }

  public getComponentSchema(component: IComponentConstructor): ComponentSchema {
    return this._registry.get(component)!
  }

  public destroyEntity(entityRef: number) {
    for (const [ , dataCollection ] of this._componentData) {
      dataCollection.remove(entityRef)
    }
  }

  public createCollections(allocator: Allocator, maxSize: number, initialSize: number) {
    for (const [ Component, component ] of this._registry) {
      const componentCollection = new ComponentCollection(allocator, component, maxSize, initialSize)
      this._componentData.set(Component, componentCollection)
      this._componentIdData.set(component.id, componentCollection)
    }
  }

  public addComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor<TSchema>
  >(entityRef: number, component: TComponentConstructor, reset = false): IComponentDataAccessor<ReturnType<InstanceType<TComponentConstructor>['registerSchema']>> {
    return this._componentData.get(component as never)!.add(entityRef, reset) as IComponentDataAccessor<ReturnType<InstanceType<TComponentConstructor>['registerSchema']>>
  }

  public getComponent<
    TSchema extends IComponentSchema,
    TComponentConstructor extends IComponentConstructor
  >(entityRef: number, component: TComponentConstructor): IComponentDataAccessor<ReturnType<InstanceType<TComponentConstructor>['registerSchema']>> {
    return this._componentData.get(component)!.get(entityRef) as IComponentDataAccessor<ReturnType<InstanceType<TComponentConstructor>['registerSchema']>>
  }

  public hasComponent(entityRef: number, component: IComponentConstructor) {
    return this._componentData.get(component)!.has(entityRef)
  }

  public removeComponent(entityRef: number, component: IComponentConstructor) {
    this._componentData.get(component)!.remove(entityRef)
  }

  public getEntityComponentsBitmask(entityRef: number): number {
    let bitmask = 0

    for (const [ componentId, collection ] of this._componentIdData) {
      if (collection.has(entityRef)) bitmask |= componentId
    }

    return bitmask
  }
}