import { AbstractSystem, Filter } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { Vector2, VECTOR2_BUFFER_2, VECTOR2_BUFFER_3 } from '@p228/math'
import { PhysicsRefs } from '@p228/physics2d'
import { SurvivorWorld } from '@p228/survivor-simulation'
import { Player } from '../../player/components/player'
import { Enemy } from '../components/enemy'
import { EnemyActiveAttack } from '../components/enemy-active-attack'
import { EnemyAttack } from '../components/enemy-attack'
import { EnemyAttackType } from '../data/enemy-attack-type'
import { AbstractEnemyAttack } from '../data/enemy-attacks/abstract-enemy-attack'
import { EnemyAttackMelee } from '../data/enemy-attacks/enemy-attack-melee'
import { EnemyAttackRam } from '../data/enemy-attacks/enemy-attack-ram'
import { EnemyAttackShoot } from '../data/enemy-attacks/enemy-attack-shoot'

const PLAYER_POSITION_BUFFER = new Vector2()
const PLAYER_COLLIDERS_BUFFER = new Array<number>()

export class EnemyAiSystem extends AbstractSystem<SurvivorWorld> {
  private _enemyAttacks!: Map<EnemyAttackType, AbstractEnemyAttack>
  private readonly _enemyAttackFilter: Filter
  private readonly _playerFilter: Filter
  private readonly _enemyFilter: Filter
  constructor(world: SurvivorWorld) {
    super(world)

    this._enemyFilter = world.registerFilter(new Filter([ Enemy ]))
    this._enemyAttackFilter = world.registerFilter(new Filter([ EnemyAttack ]))
    this._playerFilter = world.registerFilter(new Filter([ Player, Transform2d, PhysicsRefs ]))
  }

  public override initialize() {
    this._enemyAttacks = new Map<EnemyAttackType, AbstractEnemyAttack>([
      [ EnemyAttackType.Melee, new EnemyAttackMelee(this.world) ],
      [ EnemyAttackType.Shoot, new EnemyAttackShoot(this.world) ],
      [ EnemyAttackType.Ram, new EnemyAttackRam(this.world) ],
    ])
  }

  public override update() {
    const physicsWorld = this.world.physicsWorld
    const entityManager = this.world.entityManager
    const entities = this._enemyAttackFilter.entities
    const playerEntities = this._playerFilter.entities
    const playerEntityRef = playerEntities.get(0)
    if (playerEntityRef === undefined) throw new Error('Player entity not found')
    const playerPosition = PLAYER_POSITION_BUFFER.set(Transform2d.x[playerEntityRef], Transform2d.y[playerEntityRef])
    PLAYER_COLLIDERS_BUFFER.length = 0

    for (const playerEntityRef of playerEntities) {
      PLAYER_COLLIDERS_BUFFER.push(PhysicsRefs.colliderRef[playerEntityRef])
    }


    for (const attackEntityRef of entities) {
      const attackType = EnemyAttack.type[attackEntityRef]
      const attack = this._enemyAttacks.get(attackType)
      if (attack === undefined) throw new Error(`Enemy attack type not found: ${attackType}`)

      attack.setContext(attackEntityRef, playerEntityRef, playerPosition, PLAYER_COLLIDERS_BUFFER)
      attack.update()
    }

    const enemyEntities = this._enemyFilter.entities

    for (const enemyEntityRef of enemyEntities) {
      const enemyBody = physicsWorld.bodies.get(PhysicsRefs.rigidBodyRef[enemyEntityRef])!
      const translation = enemyBody.translation()

      if (entityManager.hasComponent(enemyEntityRef, EnemyActiveAttack)) {
        Transform2d.x[enemyEntityRef] = translation.x
        Transform2d.y[enemyEntityRef] = translation.y
        continue
      }

      const enemyPosition = VECTOR2_BUFFER_2.from(translation)
      const enemyDirection = Vector2.Angle(enemyPosition, playerPosition)
      const movement = VECTOR2_BUFFER_3.from(Vector2.Forward).rotate(enemyDirection).scale(4 / this.world.physicsConfig.deltaTime * 1000)
      enemyBody.setLinvel(movement, true)

      Transform2d.x[enemyEntityRef] = translation.x
      Transform2d.y[enemyEntityRef] = translation.y
      Transform2d.rotation[enemyEntityRef] = enemyDirection
    }
  }
}