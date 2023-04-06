import { AbstractGameScene, IGameSceneConstructor } from './abstract-game-scene'
import { Renderer2D } from './renderer-2d'

export class SceneManager {
  private readonly _sceneManagerReady: Promise<void>

  constructor(
    private readonly _gameRenderer: Renderer2D,
    DefaultScene: IGameSceneConstructor,
  ) {
    this._activeScene = new DefaultScene(_gameRenderer)
    this._sceneManagerReady = this.internalLoadSceneAsync(this._activeScene)
  }

  private _activeScene: AbstractGameScene

  public get activeScene(): AbstractGameScene {
    return this._activeScene
  }

  public get isReady(): Promise<void> {
    return this._sceneManagerReady
  }

  public async loadSceneAsync(Scene: IGameSceneConstructor): Promise<void> {
    this._gameRenderer.stage.removeChild(this._activeScene)
    this._activeScene.onDestroy()

    await this.internalLoadSceneAsync(new Scene(this._gameRenderer))
  }

  public readonly onUpdate = (): void => {
    this._activeScene.onUpdate(this._gameRenderer.deltaTime)
  }

  public destroy(): void {
    this._activeScene.onDestroy()
  }

  private async internalLoadSceneAsync(scene: AbstractGameScene): Promise<void> {
    this._activeScene = scene
    this._gameRenderer.stage.addChild(this._activeScene)

    await this._activeScene.onLoad()
    await this._activeScene.onAwake()
  }

}