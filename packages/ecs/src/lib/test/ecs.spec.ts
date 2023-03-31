import { expect, test } from 'vitest'
import { EcsConfig } from '../configs/ecs-config'
import { ComplexComponent } from './complex-component'
import { SimpleComponent } from './simple-component'
import { TestWorld } from './world'

describe('ECSWorld', () => {
  test('Basic', () => {
    const testWorld = new TestWorld(new EcsConfig(100, 10))
    const entityRef = testWorld.createEntity()
    const simpleComponent = testWorld.putComponent(entityRef, SimpleComponent)
    const complexComponent = testWorld.putComponent(entityRef, ComplexComponent)

    expect(simpleComponent.x).toBe(0)
    expect(simpleComponent.y).toBe(0)
    expect(complexComponent.slot).toBe(0)
    for (let i = 0; i < 16; i++) expect(complexComponent.id[i]).toBe(0)

    simpleComponent.x = 1
    simpleComponent.y = 2

    complexComponent.slot = 3
    for (let i = 0; i < 16; i++) complexComponent.id[i] = (i + 1) * 10

    expect(testWorld.getComponent(entityRef, SimpleComponent).x).toBe(1)
    expect(testWorld.getComponent(entityRef, SimpleComponent).y).toBe(2)

    expect(testWorld.getComponent(entityRef, ComplexComponent).slot).toBe(3)

    const complexComponentRef = testWorld.getComponent(entityRef, ComplexComponent)
    for (let i = 0; i < 16; i++) {
      expect(complexComponentRef.id[i]).toBe((i + 1) * 10)
    }

    testWorld['_allocator']['resize'](testWorld['_allocator'].heap.byteLength * 2)

    expect(testWorld.getComponent(entityRef, SimpleComponent).x).toBe(1)
    expect(testWorld.getComponent(entityRef, SimpleComponent).y).toBe(2)

    expect(testWorld.getComponent(entityRef, ComplexComponent).slot).toBe(3)
    const idArr = testWorld.getComponent(entityRef, ComplexComponent).id
    for (let i = 0; i < 16; i++) expect(idArr[i]).toBe((i + 1) * 10)
  })

  test('Resize Pool', () => {
    const testWorld = new TestWorld(new EcsConfig(100, 10))

    for (let i = 0; i < 10; i++) {
      const entityRef = testWorld.createEntity()
      const s = testWorld.putComponent(entityRef, SimpleComponent)
      const c = testWorld.putComponent(entityRef, ComplexComponent)
      s.x = i
      s.y = i + 1
      c.slot = i + 2
      for (let j = 0; j < 16; j++) c.id[j] = (j + 1)
    }

    const entityRef = testWorld.createEntity()
    const s = testWorld.putComponent(entityRef, SimpleComponent)
    const c = testWorld.putComponent(entityRef, ComplexComponent)
    s.x = 10
    s.y = 11
    c.slot = 12
    for (let j = 0; j < 16; j++) c.id[j] = 99

    for (let i = 0; i < 10; i++) {
      const s = testWorld.getComponent(i, SimpleComponent)
      const c = testWorld.getComponent(i, ComplexComponent)
      expect(s.x).toBe(i)
      expect(s.y).toBe(i + 1)
      expect(c.slot).toBe(i + 2)
      for (let j = 0; j < 16; j++) expect(c.id[j]).toBe(j + 1)
    }

    const s1 = testWorld.getComponent(10, SimpleComponent)
    const c1 = testWorld.getComponent(10, ComplexComponent)
    expect(s1.x).toBe(10)
    expect(s1.y).toBe(11)
    expect(c1.slot).toBe(12)
    for (let j = 0; j < 16; j++) expect(c1.id[j]).toBe(99)
  })

  test('Remove Component', () => {
    const testWorld = new TestWorld(new EcsConfig(100, 10))
    const entityRef = testWorld.createEntity()
    const s = testWorld.putComponent(entityRef, SimpleComponent)
    const c = testWorld.putComponent(entityRef, ComplexComponent)
    s.x = 1
    s.y = 2
    c.slot = 3
    for (let j = 0; j < 16; j++) c.id[j] = (j + 1) * 10

    expect(testWorld.getComponent(entityRef, SimpleComponent).x).toBe(1)
    expect(testWorld.getComponent(entityRef, SimpleComponent).y).toBe(2)
    expect(testWorld.getComponent(entityRef, ComplexComponent).slot).toBe(3)

    testWorld.removeComponent(entityRef, SimpleComponent)
    testWorld.removeComponent(entityRef, ComplexComponent)

    expect(() => testWorld.getComponent(entityRef, SimpleComponent)).toThrow()
    expect(() => testWorld.getComponent(entityRef, ComplexComponent)).toThrow()
  })
})
