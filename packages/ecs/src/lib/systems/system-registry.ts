import { ECSWorld } from '../ecs-world'
import { AbstractSystem, IAbstractSystemConstructor } from './abstract-system'

export class SystemRegistry {
  private readonly _systems = new Map<IAbstractSystemConstructor, AbstractSystem>()
  constructor(
    private readonly _world: ECSWorld,
  ) {
    const systemConstructors = this._world.registerSystems()
    for (const systemConstructor of systemConstructors) {
      this._systems.set(systemConstructor, new systemConstructor(this._world))
    }
  }

  getSystem<
    T extends AbstractSystem
  >(system: IAbstractSystemConstructor<T>): T {
     return this._systems.get(system) as T
  }
}