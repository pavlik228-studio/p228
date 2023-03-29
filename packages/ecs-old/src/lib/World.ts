import { IComponentConstructor } from './components/component';
import { ComponentsRegistry } from './components/components-registry';
import { SimulationConfig } from './configs/simulation-config';
import { EntityManager } from './entities/entity-manager';

export abstract class World {
  private readonly _entityManager: EntityManager;

  public abstract registerComponents(): Array<IComponentConstructor>;

  constructor(public readonly config: SimulationConfig) {
    this._entityManager = new EntityManager(config, this.registerComponents());
  }
}
