import { InputProvider } from '@p228/engine'
import { Physics2dConfig } from '@p228/physics2d'
import { AbstractGameScene } from '@p228/renderer-2d'
import { PlayerJoinedData, SurvivorInputSchema, SurvivorRpc, SurvivorWorld } from '@p228/survivor-simulation'
import { Layer } from '@pixi/layers'
import { GameRenderer } from '../game-renderer'
import { getRapierInstance } from '../misc/rapier-store'
import { InputListener } from './components/input-listener'
import { Map1 } from './components/map-1'
import { DebugRenderer } from './debug-renderer'
import { SurvivorEntityViewUpdater } from './entity-view-updater'
import { GameViewport } from './game-viewport'
import { EnemyGroup, FxGroup, PlayerGroup, ShadowGroup } from './layer-groups'

export class GameScene extends AbstractGameScene {
  private readonly _viewport: GameViewport
  private _world: SurvivorWorld | undefined
  private _entityViewUpdater!: SurvivorEntityViewUpdater
  private _inputProvider!: InputProvider<typeof SurvivorInputSchema>
  private _inputListener!: InputListener
  private _debugRenderer: DebugRenderer | undefined

  constructor(renderer: GameRenderer) {
    super(renderer)
    this._viewport = new GameViewport(renderer)
    this.addChild(this._viewport)
  }

  private _playerSlot: number | undefined

  public get playerSlot(): number | undefined {
    return this._playerSlot
  }

  public get viewport(): GameViewport {
    return this._viewport
  }

  public async onAwake(): Promise<void> {
    this.addChild(
      new Layer(ShadowGroup),
      new Layer(EnemyGroup),
      new Layer(PlayerGroup),
      new Layer(FxGroup),
    )
  }

  public async onDestroy(): Promise<void> {
    if (this._world) {
      this._world = undefined as any
      this._inputProvider = undefined as any
      this._inputListener.destroy()
      this._inputListener = undefined as any
      this._entityViewUpdater.dispose()
      this._viewport.removeChild(this._entityViewUpdater)
      this._entityViewUpdater.destroy()
      this._entityViewUpdater = undefined as any
      if (this._debugRenderer) {
        this._viewport.removeChild(this._debugRenderer)
        this._debugRenderer.destroy()
        this._debugRenderer = undefined
      }
    }
  }

  public async startGame(): Promise<void> {
    this._viewport.addChild(new Map1())
    const config = new Physics2dConfig(1000, {x: 0, y: 0})
    this._inputProvider = new InputProvider(SurvivorInputSchema)
    this._inputListener = new InputListener(this._inputProvider)
    this._world = new SurvivorWorld(config, this._inputProvider, getRapierInstance())
    this._inputProvider.setWorld(this._world)
    this._entityViewUpdater = new SurvivorEntityViewUpdater(this._world, this)
    this._viewport.addChild(this._entityViewUpdater)
    this._playerSlot = this._inputProvider.playerSlot
    this._inputProvider.setRpc(SurvivorRpc.PlayerJoined, new PlayerJoinedData(this._playerSlot))
    this._debugRenderer = new DebugRenderer(this._world, this._renderer)
    this._debugRenderer.parentGroup = PlayerGroup
    this._viewport.addChild(this._debugRenderer)
  }

  public onUpdate(dt: number): void {
    if (this._world !== undefined) {
      this._world.update(dt)
      this._entityViewUpdater.update(dt)
    }
    if (this._debugRenderer !== undefined) this._debugRenderer.onUpdate()
  }
}