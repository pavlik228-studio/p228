import { AbstractSystem, DataType, defineComponent, ECSWorld, Filter } from '@p228/ecs'
import { describe, expect, test } from 'vitest'
import { ECSConfig } from '../ecs-config'
import { TestComponent } from './test-component'
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
  })

  test('Benchmark', () => {
    const A = defineComponent({value: DataType.i32});
    const B = defineComponent({value: DataType.i32});
    const C = defineComponent({value: DataType.i32});
    const D = defineComponent({value: DataType.i32});
    const E = defineComponent({value: DataType.i32});
    class TestSystem extends AbstractSystem {
      public readonly filterAB: Filter
      public readonly filterCD: Filter
      public readonly filterCE: Filter
      constructor(world: ECSWorld) {
        super(world)
        this.filterAB = this.world.registerFilter(new Filter([ A, B ]))
        this.filterCD = this.world.registerFilter(new Filter([ C, D ]))
        this.filterCE = this.world.registerFilter(new Filter([ C, E ]))
      }
    }

    const config = new ECSConfig(4000)
    class SimpleIterWorld extends ECSWorld {
      constructor() {
        super(config)
      }

      registerSystems() {
        return [
          TestSystem,
        ]
      }

      registerComponents() {
        return [
          A,
          B,
          C,
          D,
          E,
        ]
      }
    }
    const simpleIterWorld = new SimpleIterWorld()
    const entityManager = simpleIterWorld.entityManager

    for (let i = 0; i < 1000; i++) {
      let e1 = entityManager.createEntity()
      entityManager.addComponent(e1, A)
      A.value[e1] = 0
      entityManager.addComponent(e1, B);
      B.value[e1] = 1

      let e2 = entityManager.createEntity()
      entityManager.addComponent(e2, A);
      A.value[e2] = 0;
      entityManager.addComponent(e2, B);
      B.value[e2] = 1;
      entityManager.addComponent(e2, C);
      C.value[e2] = 2;

      let e3 = entityManager.createEntity()
      entityManager.addComponent(e3, A);
      A.value[e3] = 0;
      entityManager.addComponent(e3, B);
      B.value[e3] = 1;
      entityManager.addComponent(e3, C);
      C.value[e3] = 2;
      entityManager.addComponent(e3, D);
      D.value[e3] = 3;

      let e4 = entityManager.createEntity()
      entityManager.addComponent(e4, A);
      A.value[e4] = 0;
      entityManager.addComponent(e4, B);
      B.value[e4] = 1;
      entityManager.addComponent(e4, C);
      C.value[e4] = 2;
      entityManager.addComponent(e4, E);
      E.value[e4] = 3;
    }

    const testSystem = simpleIterWorld.getSystem(TestSystem)
    const filterAB = Array.from(testSystem.filterAB.entities)
    const filterCD = Array.from(testSystem.filterCD.entities)
    const filterCE = Array.from(testSystem.filterCE.entities)

    let OPERATIONS = 0

    const update = () => {
      // console.time('P228')
      for (const eid of filterAB) {
        OPERATIONS++
        const x = A.value[eid];
        A.value[eid] = B.value[eid];
        D.value[eid] = x;
      }
      for (const eid of filterCD) {
        OPERATIONS++
        const x = C.value[eid];
        C.value[eid] = D.value[eid];
        D.value[eid] = x;
      }
      for (const eid of filterCE) {
        OPERATIONS++
        const x = C.value[eid];
        C.value[eid] = E.value[eid];
        E.value[eid] = x;
      }
      // console.timeEnd('P228')
    }
    console.time('P228')
    update()
    console.timeEnd('P228')
    console.log(OPERATIONS)
  })
})