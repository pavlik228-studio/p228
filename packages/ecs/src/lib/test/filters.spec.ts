import { describe, expect, test } from 'vitest'
import { EcsConfig } from '../configs/ecs-config'
import { ComplexComponent } from './complex-component'
import { SimpleComponent } from './simple-component'
import { TestSystem } from './test-system'
import { TestWorld } from './world'

describe('ECS Filters', () => {
  test('Basic', () => {
    console.log('FILTERS TEST')
    const testWorld = new TestWorld(new EcsConfig(100, 10))
    const entityManager = testWorld.entityManager
    const entityRef = testWorld.createEntity()
    entityManager.putComponent(entityRef, SimpleComponent)
    entityManager.putComponent(entityRef, ComplexComponent)

    const testSystem = testWorld.getSystem(TestSystem)

    expect(testSystem.simpleComponentFilter.length).toBe(1)

    const entityRef2 = testWorld.createEntity()
    testWorld.putComponent(entityRef2, SimpleComponent)

    expect(testSystem.simpleComponentFilter.length).toBe(2)

    const entityRef3 = entityManager.createEntity()
    entityManager.putManyComponents(entityRef3, [ SimpleComponent, ComplexComponent ])

    expect(testSystem.simpleComponentFilter.length).toBe(3)
    expect(Array.from(testSystem.simpleComponentFilter)).toEqual([ entityRef, entityRef2, entityRef3 ])

    expect(testSystem.complexComponentFilter.length).toBe(2)
    expect(Array.from(testSystem.complexComponentFilter)).toEqual([ entityRef, entityRef3 ])

    expect(testSystem.includeBothFilter.length).toBe(2)
    expect(Array.from(testSystem.includeBothFilter)).toEqual([ entityRef, entityRef3 ])

    expect(testSystem.includeSimpleExcludeComplexFilter.length).toBe(1)
    expect(Array.from(testSystem.includeSimpleExcludeComplexFilter)).toEqual([ entityRef2 ])

    expect(testSystem.duplicateFilter['_list']).toBe(testSystem.includeBothFilter['_list'])
    expect(testSystem.duplicateFilter.length).toBe(testSystem.includeBothFilter.length)
    expect(Array.from(testSystem.duplicateFilter)).toEqual(Array.from(testSystem.includeBothFilter))
  })
})