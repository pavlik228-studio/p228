import { AbstractSystem } from '@p228/ecs'
import { PhysicsRefs } from '../components/collider-ref'
import { Physics2dWorld } from '../physics2d-world'

export class TestSystem extends AbstractSystem<Physics2dWorld> {
  public override update() {
    console.log('TestSystem.update()', this.world.tick)
    if (this.world.tick === 1) {
      const entityManager = this.world.entityManager
      const physicsWorld = this.world.physicsWorld
      for (let i = 0; i < 3; i++) {
        const entityRef = entityManager.createEntity()
        const collider = physicsWorld.createCollider(this.world.rapierInstance.ColliderDesc.cuboid(1, 1))
        entityManager.addComponent(entityRef, PhysicsRefs)
        PhysicsRefs.colliderRef[entityRef] = collider.handle

        console.log('collider.handle', collider.handle, PhysicsRefs.colliderRef[entityRef])
      }
    }
  }
}