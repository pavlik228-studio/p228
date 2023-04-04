import { ECSWorld } from '../ecs-world'
import { AbstractSystem, ISystemConstructor } from './abstract-system'

export class SystemRegistry {
  public readonly _registry = new Map<ISystemConstructor, AbstractSystem>()

  constructor(
    private readonly _world: ECSWorld,
    private readonly _systems: Array<ISystemConstructor>,
  ) {
    for (const system of _systems) {
      this._registry.set(system, new system(_world))
    }
  }

  public initializePipeline(): () => void {
    for (const system of this._registry.values()) {
      system.initialize()
    }

    const systemUpdates = Array.from(this._registry.values()).map((system) => system.update.bind(system))

    return () => {
      for (const update of systemUpdates) {
        update()
      }
    }
  }


}