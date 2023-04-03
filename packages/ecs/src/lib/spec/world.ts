import { ECSWorld } from '../ecs-world'
import { PositionComponent } from './position-component'
import { TestComponent } from './test-component'
import { TestSingleton } from './test-singleton'
import { TestSystem } from './test-system'

export class TestWorld extends ECSWorld {
  public registerComponents() {
    return [
      TestComponent,
      PositionComponent,
    ]
  }

  public override registerSingletonComponents() {
    return [
      TestSingleton,
    ]
  }

  public registerSystems() {
    return [
      TestSystem,
    ]
  }
}