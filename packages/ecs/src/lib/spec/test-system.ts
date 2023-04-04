import { ECSWorld } from '../ecs-world'
import { Filter } from '../filters/filter'
import { AbstractSystem } from '../systems/abstract-system'
import { PositionComponent } from './position-component'
import { TestComponent } from './test-component'

export class TestSystem extends AbstractSystem {
  public readonly positionFilter: Filter
  public readonly testFilter: Filter
  public readonly testAndPositionFilter: Filter
  constructor(world: ECSWorld) {
    super(world)
    this.positionFilter = world.registerFilter(new Filter([ PositionComponent ]))
    this.testFilter = world.registerFilter(new Filter([ TestComponent ]))
    this.testAndPositionFilter = world.registerFilter(new Filter([ TestComponent, PositionComponent ]))
  }
}