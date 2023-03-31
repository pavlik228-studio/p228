import { ECSWorld } from '../ecs-world'

export interface IAbstractSystemConstructor<T extends AbstractSystem = AbstractSystem> {
  new (world: ECSWorld): T
}

export abstract class AbstractSystem {
  constructor(public readonly world: ECSWorld) {}
  public update(): void {}
  public destroy(): void {}
}