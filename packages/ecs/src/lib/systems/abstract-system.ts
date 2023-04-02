import { ECSWorld } from '../ecs-world'

export interface ISystemConstructor {
  new(world: ECSWorld): AbstractSystem
}

export abstract class AbstractSystem {
  // Constructor is called before initialize, allocation isn't allowed here
  // Used for registering filters
  constructor(public readonly world: ECSWorld) {

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