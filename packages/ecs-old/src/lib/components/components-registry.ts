import { Heap } from '../heap';
import { Int } from '../types';
import { Component, IComponentConstructor } from './component';
import { IComponentSchemaDefinition } from './component-schema';

export class ComponentsRegistry {
  private readonly _components = new Map<IComponentConstructor, Component>();

  public registerComponent(
    componentConstructor: IComponentConstructor,
    heap: Heap,
    byteOffset: Int
  ): Int {
    const component = new componentConstructor(heap, byteOffset);
    this._components.set(componentConstructor, component);
    return component.byteLength;
  }

  public getComponent<TSchema extends IComponentSchemaDefinition>(
    componentConstructor: IComponentConstructor<TSchema>
  ): Component<TSchema> {
    return this._components.get(componentConstructor) as Component<TSchema>;
  }

  public hasComponent(componentConstructor: IComponentConstructor): boolean {
    return this._components.has(componentConstructor);
  }

  public *[Symbol.iterator](): IterableIterator<Component> {
    yield* this._components.values();
  }
}
