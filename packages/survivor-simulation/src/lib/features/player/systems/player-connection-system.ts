import { AbstractSystem } from '@p228/ecs'
import { Rpc } from '@p228/engine'
import { PlayerJoinedData } from '@p228/survivor-simulation'
import { SurvivorRpc } from '../../../input/survivor-rpc'
import { SurvivorWorld } from '../../../survivor-world'
import { EnemyType } from '../../enemy/data/enemy-type'
import { spawnEnemy } from '../../enemy/misc/spawn-enemy'
import { spawnPlayer } from '../misc/spawn-player'

export class PlayerConnectionSystem extends AbstractSystem<SurvivorWorld> {
  private readonly _playerJoinedRPCs= new Array<Rpc<PlayerJoinedData>>()
  constructor(world: SurvivorWorld) {
    super(world)
  }

  public override update() {
    this.world.inputProvider.rpcHistory.getRPCsByType(this.world.tick, SurvivorRpc.PlayerJoined, this._playerJoinedRPCs)

    for (const rpc of this._playerJoinedRPCs) {
      spawnPlayer(this.world, rpc)
      spawnEnemy(this.world, EnemyType.MeleeSkull, { x: 200, y: 0 })
      spawnEnemy(this.world, EnemyType.RamSkull, { x: 600, y: 300 })
      spawnEnemy(this.world, EnemyType.RangeSkull, { x: -700, y: 0 })
      spawnEnemy(this.world, EnemyType.ShieldSkull, { x: 700, y: -300 })

      for (let i = 0; i < 10; i++) {
        spawnEnemy(this.world, EnemyType.MeleeSkull, { x: 200 + Math.random() * 1000 - 500, y: Math.random() * 1000 - 500 })
      }

      for (let i = 0; i < 10; i++) {
        spawnEnemy(this.world, EnemyType.ShieldSkull, { x: 200 + Math.random() * 1000 - 500, y: Math.random() * 1000 - 500 })
      }
    }

    this._playerJoinedRPCs.length = 0
  }
}