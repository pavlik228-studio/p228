import { describe, expect, test } from 'vitest'
import { ECSConfig } from '../ecs-config'
import { PositionComponent } from './position-component'
import { TestComponent } from './test-component'
import { TestSingleton } from './test-singleton'
import { TestSystem } from './test-system'
import { TestWorld } from './world'

describe('ecs', () => {
  test('world', () => {
    const world = new TestWorld(new ECSConfig(1000))
    const entityManager = world.entityManager
    const testSystem = world.getSystem(TestSystem)
    const testFilter = testSystem.testFilter
    const positionFilter = testSystem.positionFilter

    const entityRef1 = entityManager.createEntity()

    expect(entityRef1).toBe(0)
    expect(entityManager.hasComponent(entityRef1, TestComponent)).toBe(false)

    entityManager.addComponent(entityRef1, TestComponent)

    expect(entityManager.hasComponent(entityRef1, TestComponent)).toBe(true)

    expect(Array.from(testFilter.entities)).toEqual([0])
    expect(positionFilter.entities.length).toBe(0)

    TestComponent.a[entityRef1] = 1

    TestSingleton.level = 1

    for (let i = 0; i < 10; i++) {
      TestSingleton.bullets[i] = i + 10
    }

    expect(TestSingleton.level).toBe(1)
    expect(TestSingleton.bullets).toEqual(new Uint32Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]))
  })

  test('fill', () => {
    const world = new TestWorld(new ECSConfig(100))
    const entityManager = world.entityManager

    TestSingleton.level = 1
    TestSingleton.bullets.fill(99)

    for (let i = 0; i < 100; i++) {
      const entityRef = entityManager.createEntity()
      entityManager.addComponent(entityRef, TestComponent)

      TestComponent.a[entityRef] = i
      TestComponent.b[entityRef] = i + 1
    }

    expect(TestSingleton.level).toBe(1)
    expect(TestSingleton.bullets).toEqual(new Uint32Array(10).fill(99))

    for (let i = 0; i < 100; i++) {
      expect(TestComponent.a[i]).toBe(i)
      expect(TestComponent.b[i]).toBe(i + 1)
    }

    expect(TestSingleton.level).toBe(1)
    expect(TestSingleton.bullets).toEqual(new Uint32Array(10).fill(99))
  })

  test('filters', () => {
    const world = new TestWorld(new ECSConfig(100))
    const entityManager = world.entityManager
    const testSystem = world.getSystem(TestSystem)
    const testFilter = testSystem.testFilter
    const positionFilter = testSystem.positionFilter
    const testAndPositionFilter = testSystem.testAndPositionFilter

    for (let i = 0; i < 100; i++) {
      const entityRef = entityManager.createEntity()

      if (i % 2 === 0) {
        entityManager.addComponent(entityRef, TestComponent)
        TestComponent.a[entityRef] = i
        TestComponent.b[entityRef] = i + 1
      } else {
        entityManager.addComponent(entityRef, PositionComponent)
        PositionComponent.x[entityRef] = i
        PositionComponent.y[entityRef] = i + 1
      }
    }

    expect(testFilter.entities.length).toBe(50)
    expect(positionFilter.entities.length).toBe(50)
    expect(testAndPositionFilter.entities.length).toBe(0)

    for (const testEntity of testFilter.entities) {
      entityManager.addComponent(testEntity, PositionComponent)
      PositionComponent.x[testEntity] = 500
      PositionComponent.y[testEntity] = 501
    }

    expect(testFilter.entities.length).toBe(50)

    const arr = Array.from(testFilter.entities)
    for (const testEntity of arr) {
      entityManager.removeComponent(testEntity, TestComponent)
    }

    expect(testFilter.entities.length).toBe(0)
    expect(positionFilter.entities.length).toBe(100)
    expect(testAndPositionFilter.entities.length).toBe(0)
  })
})