import { ECSWorld } from '../ecs-world'
import { IAbstractSystemConstructor } from '../systems/abstract-system'
import { ComplexComponent } from './complex-component'
import { SimpleComponent } from './simple-component'
import { TestSystem } from './test-system'

export class TestWorld extends ECSWorld {
  public override registerComponents() {
    return [
      SimpleComponent,
      ComplexComponent
    ]
  }

  public registerSystems(): Array<IAbstractSystemConstructor> {
    return [
      TestSystem,
    ]
  }
}