import { AbstractSystem, Filter } from '@p228/ecs'
import { SimulationWorld } from '@p228/engine'
import { Transform2d } from '../components/transform-2d'

export class PrevTransformSystem extends AbstractSystem {
  private readonly _transform2dFilter: Filter
  constructor(world: SimulationWorld) {
    super(world)
    this._transform2dFilter = world.registerFilter(new Filter([ Transform2d ]))
  }

  public override update() {
    const entities = this._transform2dFilter.entities

    for (const entityRef of entities) {
      Transform2d.prevX[entityRef] = Transform2d.x[entityRef]
      Transform2d.prevY[entityRef] = Transform2d.y[entityRef]
      Transform2d.prevRotation[entityRef] = Transform2d.rotation[entityRef]
    }
  }
}