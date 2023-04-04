import { InputProvider, SimulationConfig } from '@p228/engine'
import { SimulationEvents } from '../events/simulation-events'
import { SimulationWorld } from '../simulation-world'
import { SimpleComponent } from './simple-component'
import { SingletonComponent } from './singleton-component'
import { TestSystem } from './system'
import { TestEvent } from './test-event'

export class TestWorld extends SimulationWorld {
  constructor(simulationConfig: SimulationConfig, inputProvider: InputProvider) {
    super(simulationConfig, inputProvider)
    this.initializeInternal()
  }
  public registerComponents() {
    return [
      SimpleComponent,
    ]
  }

  public registerSingletonComponents() {
    return [
      SingletonComponent,
    ]
  }

  public registerSystems() {
    return [
      TestSystem,
    ]
  }

  protected override registerEvents(simulationEvents: SimulationEvents) {
    simulationEvents.register(TestEvent)
  }

}