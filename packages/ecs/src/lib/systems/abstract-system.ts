import { ECSWorld } from '../ecs-world'

export interface ISystemConstructor<TWorld extends ECSWorld = ECSWorld> {
  new(world: TWorld): AbstractSystem<TWorld>
}

export abstract class AbstractSystem<TWorld extends ECSWorld = ECSWorld> {
  // Constructor is called before initialize, allocation isn't allowed here
  // Used for registering filters
  constructor(public readonly world: TWorld) {

  }

  // Initialize is called after constructor, allocation is allowed here
  // it's allowed to use components here
  public initialize(): void {
  }

  public update(): void {
  }

  public destroy(): void {
  }
}