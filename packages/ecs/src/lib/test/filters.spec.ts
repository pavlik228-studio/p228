import { describe, test } from 'vitest'
import { EcsConfig } from '../configs/ecs-config'
import { ComplexComponent } from './complex-component'
import { SimpleComponent } from './simple-component'
import { TestSystem } from './test-system'
import { TestWorld } from './world'

describe('ECS Filters', () => {
  test('Basic', () => {
    console.log('FILTERS TEST')
    const testWorld = new TestWorld(new EcsConfig(100, 10))
    const entityRef = testWorld.createEntity()
    const simpleComponent = testWorld.putComponent(entityRef, SimpleComponent)
    const complexComponent = testWorld.putComponent(entityRef, ComplexComponent)

    const testSystem = testWorld.getSystem(TestSystem)

    for (const entity of testSystem.simpleComponentFilter) {
      console.log(entity)
    }
  })
})