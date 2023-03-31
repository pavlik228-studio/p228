import { ECSWorld } from '../ecs-world'
import { Filter } from '../filters/filter'
import { AbstractSystem } from '../systems/abstract-system'
import { SimpleComponent } from './simple-component'

export class TestSystem extends AbstractSystem {
  public readonly simpleComponentFilter: Filter
  constructor(world: ECSWorld) {
    super(world)
    this.simpleComponentFilter = world.registerFilter(new Filter([ SimpleComponent ]))
  }
}