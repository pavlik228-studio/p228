import { Logger } from '@p228/ecs'
import { describe, expect, test } from 'vitest'
import { SimulationConfig } from '../simulation-config'
import { SimpleComponent } from './simple-component'
import { SingletonComponent } from './singleton-component'
import { TestEvent } from './test-event'
import { TestInputProvider } from './test-input-provider'
import { TestWorld } from './world'

describe('simulation', () => {
  test('Basic', () => {
    Logger.log = () => {}
    const inputProvider = new TestInputProvider()
    const config = new SimulationConfig(100, undefined, undefined, 2)
    const world = new TestWorld(config, inputProvider)

    world.update(1000 / 60 * 4)
    world.update(1000 / 60 )

    expect(world.tick).toBe(5)

    world['rollback'](0)
    expect(world.tick).toBe(0)

    expect(SingletonComponent.x).toBe(0)
    expect(SingletonComponent.y).toBe(0)

    for (let i = 0; i < 100; i++) {
      expect(SimpleComponent.lol[i]).toBe(0)
      expect(SimpleComponent.kek[i]).toBe(0)
    }

    world.update(1000 / 60)
    expect(world.tick).toBe(6)

    expect(SingletonComponent.x).toBe(10000)
    expect(SingletonComponent.y).toBe(20000)

    for (let i = 0; i < 100; i++) {
      expect(SimpleComponent.lol[i]).toBe(i)
      expect(SimpleComponent.kek[i]).toBe(i * 2)
    }

  })

  test('Events', () => {
    const inputProvider = new TestInputProvider()
    const config = new SimulationConfig(100, undefined, 4)
    const world = new TestWorld(config, inputProvider)
    const simulationEvents = world.simulationEvents

    let predicted = 0
    let verified = 0

    const onEventPredicted = () => predicted++
    const onEventVerified = () => verified++

    simulationEvents.Predicted.subscribe(TestEvent, onEventPredicted)
    simulationEvents.Verified.subscribe(TestEvent, onEventVerified)

    world.update(1000 / 60 * 4)

    expect(predicted).toBe(1)
    expect(verified).toBe(0)

    world.update(1000 / 60)

    expect(predicted).toBe(1)
    expect(verified).toBe(1)

  })
})