import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { PhysicsRefs } from '@p228/physics2d'
import { MoveData, SurvivorRpc, SurvivorWorld } from '@p228/survivor-simulation'
import { Player } from '../components/player'

export class PlayerInputSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _playerFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)
    this._playerFilter = world.registerFilter(new Filter([ Player, Transform2d, PhysicsRefs ]))
  }

  public override update() {
    const rpcHistory = this.world.inputProvider.rpcHistory
    const entities = this._playerFilter.entities

    for (const entityRef of entities) {
      const moveRPCs = rpcHistory.getPlayerRPCs(this.world.tick, Player.slot[entityRef])

      for (const rpc of moveRPCs) {
        if (rpc.rpc === SurvivorRpc.Move) {
          const data = rpc.data as MoveData
          Player.direction[entityRef] = data.direction
          Player.speed[entityRef] = data.speed
        }
      }
    }
  }
}