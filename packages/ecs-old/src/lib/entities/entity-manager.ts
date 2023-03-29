import { IComponentConstructor } from '../components/component';
import { ComponentsRegistry } from '../components/components-registry';
import { SimulationConfig } from '../configs/simulation-config';
import { Heap } from '../heap';
import { SparseSet } from '../misc/sparse-set';
import { Int } from '../types';
import { EntityRef } from './types';

export class EntityManager {
  private readonly _heap: Heap;
  public readonly componentsRegistry = new ComponentsRegistry();
  public readonly sparseSetRegistry = new Map<
    IComponentConstructor,
    SparseSet
  >();

  constructor(
    public readonly config: SimulationConfig,
    components: Array<IComponentConstructor>
  ) {
    this._heap = new Heap(config.entityPoolSize, this, components);
  }

  public registerComponentSparseSet(
    componentConstructor: IComponentConstructor,
    entityPoolSize: number,
    byteOffset: Int
  ): Int {
    const sparseSet = new SparseSet(entityPoolSize, byteOffset);
    this.sparseSetRegistry.set(componentConstructor, sparseSet);
    return sparseSet.byteLength;
  }

  public registerComponent(
    componentConstructor: IComponentConstructor,
    heap: Heap,
    byteOffset: Int
  ) {
    return this.componentsRegistry.registerComponent(
      componentConstructor,
      heap,
      byteOffset
    );
  }

  public createEntity(): EntityRef {
    const entityId = this._heap.entitiesSparseSet.getNextId();

    this._heap.entitiesSparseSet.set(entityId);

    return entityId;
  }

  public hasEntity(entityId: EntityRef): boolean {
    return this._heap.entitiesSparseSet.has(entityId);
  }

  public removeEntity(entityId: EntityRef): void {
    this._heap.entitiesSparseSet.remove(entityId);
    this.sparseSetRegistry.forEach((sparseSet) => sparseSet.remove(entityId));
  }

  public addComponent(
    entityId: EntityRef,
    componentConstructor: IComponentConstructor
  ): void {
    const sparseSet = this.sparseSetRegistry.get(componentConstructor)!;
    sparseSet.set(entityId);
  }

  public hasComponent(
    entityId: EntityRef,
    componentConstructor: IComponentConstructor
  ): boolean {
    const sparseSet = this.sparseSetRegistry.get(componentConstructor)!;
    return sparseSet.has(entityId);
  }

  public removeComponent(
    entityId: EntityRef,
    componentConstructor: IComponentConstructor
  ): void {
    const sparseSet = this.sparseSetRegistry.get(componentConstructor)!;
    sparseSet.remove(entityId);
  }
}
