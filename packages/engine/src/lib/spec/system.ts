import { AbstractSystem } from '@p228/ecs'
import { SimulationWorld } from '../simulation-world'
import { SimpleComponent } from './simple-component'
import { SingletonComponent } from './singleton-component'
import { TestEvent } from './test-event'

export class TestSystem extends AbstractSystem<SimulationWorld> {
  constructor(world: SimulationWorld) {
    super(world)
    console.log(this.world.constructor.name)
  }

  public override initialize(): void {
    console.log('initialize', this.world.constructor.name)
  }

  public override update(): void {
    console.log('update', this.world.tick)
    if (this.world.tick === 1) {
      this.world.simulationEvents.emit(TestEvent, 1, 99)
    }
    if (this.world.tick === 2) {
      SingletonComponent.x = 10000
      SingletonComponent.y = 20000

      for (let i = 0; i < 100; i++) {
        const entityRef = this.world.entityManager.createEntity()
        this.world.entityManager.addComponent(entityRef, SimpleComponent)
        SimpleComponent.lol[entityRef] = i
        SimpleComponent.kek[entityRef] = i * 2
      }
    }
  }
}