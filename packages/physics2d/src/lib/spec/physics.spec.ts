import { InputProvider } from '@p228/engine'
import { describe, expect, test } from 'vitest'
import { PhysicsRefs } from '../components/physics-ref'
import { Physics2dConfig } from '../physics-config'
import { GameWorld } from './world'
import RAPIER from '@dimforge/rapier2d-compat'

describe('physics', () => {
  test('Basics', async () => {
    await RAPIER.init()
    const config = new Physics2dConfig(10, { x: 0, y: 10 })
    const gameWorld = new GameWorld(config, new InputProvider(), RAPIER as any)

    gameWorld.update(1000 / 60 * 4)

    expect(gameWorld.physicsWorld.colliders.len()).toBe(3)
    expect(PhysicsRefs.colliderRef[0]).toBe(0)
    expect(PhysicsRefs.colliderRef[1]).toBe(5e-324)
    expect(PhysicsRefs.colliderRef[2]).toBe(1e-323)

    gameWorld['rollback'](0)

    expect(gameWorld.physicsWorld.colliders.len()).toBe(0)
    expect(PhysicsRefs.colliderRef[0]).toBe(0)
    expect(PhysicsRefs.colliderRef[1]).toBe(0)
    expect(PhysicsRefs.colliderRef[2]).toBe(0)
  })
})