import { ECSWorld } from '../ecs-world'
import { Filter } from '../filters/filter'
import { AbstractSystem } from '../systems/abstract-system'
import { ComplexComponent } from './complex-component'
import { SimpleComponent } from './simple-component'

export class TestSystem extends AbstractSystem {
  public readonly simpleComponentFilter: Filter
  public readonly complexComponentFilter: Filter
  public readonly includeBothFilter: Filter
  public readonly includeSimpleExcludeComplexFilter: Filter
  public readonly duplicateFilter: Filter

  constructor(world: ECSWorld) {
    super(world)
    this.simpleComponentFilter = world.registerFilter(new Filter([ SimpleComponent ]))
    this.complexComponentFilter = world.registerFilter(new Filter([ ComplexComponent ]))
    this.includeBothFilter = world.registerFilter(new Filter([ SimpleComponent, ComplexComponent ]))
    this.includeSimpleExcludeComplexFilter = world.registerFilter(new Filter([ SimpleComponent ], [ ComplexComponent ]))
    this.duplicateFilter = world.registerFilter(new Filter([ SimpleComponent, ComplexComponent ]))
  }
}