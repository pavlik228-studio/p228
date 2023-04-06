import { PhysicsRefs } from '../components/physics-ref'
import { Physics2dWorld } from '../physics2d-world'
import { TestSystem } from './system'

export class GameWorld extends Physics2dWorld {
  public registerComponents() {
    return [
      PhysicsRefs,
    ]
  }

  public registerSingletonComponents() {
    return [

    ]
  }

  public registerSystems() {
    return [
      TestSystem,
    ]
  }

}