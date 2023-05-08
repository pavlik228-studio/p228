import { InputProvider } from '@p228/engine'
import { Physics2dConfig } from '@p228/physics2d'
import { AbstractGameScene } from '@p228/renderer-2d'
import {
  BuyShopItemData,
  IShopItem, Item, ItemId, ItemsData,
  Player,
  PlayerCharacter,
  PlayerJoinedData, RerollShopData, ShopActions, ShopItemType,
  SurvivorInputSchema,
  SurvivorRpc,
  SurvivorWorld, Weapon, WeaponData, WeaponType,
} from '@p228/survivor-simulation'
import { Layer } from '@pixi/layers'
import { GameRenderer } from '../game-renderer'
import { getRapierInstance } from '../misc/rapier-store'
import { DamageText } from './components/damage-text'
import { Hud } from './components/hud/hud'
import { InputListener } from './components/input-listener'
import { DebugRenderer } from './debug-renderer'
import { SurvivorEntityViewUpdater } from './entity-view-updater'
import { GameEvents } from './game-events'
import { GameViewport } from './game-viewport'
import { EnemyGroup, FxGroup, GoldGroup, PlayerGroup, ShadowGroup } from './layer-groups'
import { MapGrass } from './maps/map-grass'

export class GameScene extends AbstractGameScene {
  private readonly _viewport: GameViewport
  private readonly _hud: Hud
  private _entityViewUpdater!: SurvivorEntityViewUpdater
  private _inputProvider!: InputProvider<typeof SurvivorInputSchema>
  private _inputListener!: InputListener
  private _debugRenderer: DebugRenderer | undefined
  private _gameEvents!: GameEvents
  private _damageText!: DamageText
  private _turnBasedMode = false

  constructor(renderer: GameRenderer) {
    super(renderer)
    this._viewport = new GameViewport(renderer)
    this.addChild(this._viewport)

    this.addChild(
      new Layer(ShadowGroup),
      new Layer(GoldGroup),
      new Layer(EnemyGroup),
      new Layer(PlayerGroup),
      new Layer(FxGroup),
    )

    this._hud = new Hud(renderer)
    this.addChild(this._hud)
  }

  private _world: SurvivorWorld | undefined

  public get world(): SurvivorWorld {
    return this._world!
  }

  private _playerSlot: number | undefined

  public get playerSlot(): number | undefined {
    return this._playerSlot
  }

  public get viewport(): GameViewport {
    return this._viewport
  }

  public async onAwake(): Promise<void> {
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
      this._gameEvents.destroy()
      this._damageText.destroy()
      if (this._debugRenderer) {
        this._viewport.removeChild(this._debugRenderer)
        this._debugRenderer.destroy()
        this._debugRenderer = undefined
      }
    }
  }

  public async initializeGame(character: PlayerCharacter): Promise<void> {
    this._turnBasedMode = true
    this._viewport.addChild(new MapGrass())
    const config = new Physics2dConfig(1000, {
      x: 0,
      y: 0,
    }, 0, void 0, void 0, 0, void 0, void 0, void 0, void 0, void 0, 16)
    this._inputProvider = new InputProvider(SurvivorInputSchema)
    this._inputListener = new InputListener(this._inputProvider)
    this._world = new SurvivorWorld(config, this._inputProvider, getRapierInstance())
    this._inputProvider.setWorld(this._world)
    this._entityViewUpdater = new SurvivorEntityViewUpdater(this._world, this)
    this._viewport.addChild(this._entityViewUpdater)
    this._playerSlot = this._inputProvider.playerSlot
    this._inputProvider.setRpc(SurvivorRpc.PlayerJoined, new PlayerJoinedData(this._playerSlot, character))
    // this._debugRenderer = new DebugRenderer(this._world, this._renderer)
    // this._debugRenderer.parentGroup = PlayerGroup
    // this._viewport.addChild(this._debugRenderer)
    this._gameEvents = new GameEvents(this._world, this._viewport)
    this._damageText = new DamageText(this._world, this._playerSlot)
    this._hud.reset(80)
    this._viewport.addChild(this._damageText)
    this._world.update(this._world.config.deltaTime)
  }

  public startGame(): void {
    this._turnBasedMode = false
    this._renderer.resizer.enqueueResize()
  }

  public onUpdate(dt: number): void {
    if (this._turnBasedMode) return
    if (this._world !== undefined) {
      this._world.update(dt)
      this._entityViewUpdater.update(dt)
      this._damageText.update(dt)
      this._hud.onUpdate(this._playerSlot!, this._world)
    }
    if (this._debugRenderer !== undefined) this._debugRenderer.onUpdate()
  }

  public getStopState() {
    return ShopActions.getShopState(this.getPlayerEntityRefBySlot(this._playerSlot!))
  }

  public getShopSlotsCount() {
    const playerEntityRef = this.getPlayerEntityRefBySlot(this._playerSlot!)

    return Player.shopSlots[playerEntityRef]
  }

  public getWeapons() {
    const playerEntityRef = this.getPlayerEntityRefBySlot(this._playerSlot!)
    const weapons = new Array<IShopItem>()

    for (const weaponEntityRef of this._world!.filterWeapon) {
      if (Weapon.ownerRef[weaponEntityRef] !== playerEntityRef) continue
      const weaponLvl = Weapon.level[weaponEntityRef]
      const weaponType = Weapon.type[weaponEntityRef] as WeaponType
      const weaponValues = WeaponData[weaponType]

      weapons.push({
        type: ShopItemType.Weapon,
        price: weaponValues.price[weaponLvl],
        itemId: weaponType,
        level: weaponLvl,
      })
    }

    return weapons
  }

  public getItems() {
    const playerEntityRef = this.getPlayerEntityRefBySlot(this._playerSlot!)
    const items = new Array<IShopItem>()

    for (const itemEntityRef of this._world!.filterItem) {
      if (Item.ownerRef[itemEntityRef] !== playerEntityRef) continue
      const itemId = Item.id[itemEntityRef] as ItemId
      const itemValues = ItemsData[itemId]

      items.push({
        itemId,
        type: ShopItemType.Item,
        price: itemValues.price,
        level: itemValues.level,
      })
    }

    return items
  }

  public getGoldBalance() {
    return Player.goldBalance[this.getPlayerEntityRefBySlot(this._playerSlot!)]
  }

  public getRerollPrice() {
    return ShopActions.getRerollPrice(this.getPlayerEntityRefBySlot(this._playerSlot!))
  }

  public buyShopItem(shopSlot: number): void {
    this._inputProvider.setRpc(SurvivorRpc.BuyShopItem, new BuyShopItemData(shopSlot))
    this._world!.nextTick()
  }

  public rerollShop(): void {
    this._inputProvider.setRpc(SurvivorRpc.RerollShop, new RerollShopData())
    this._world!.nextTick()
  }

  private getPlayerEntityRefBySlot(slot: number) {
    if (this._world) {
      for (const playerEntityRef of this._world.filterPlayer) {
        if (Player.slot[playerEntityRef] === slot) {
          return playerEntityRef
        }
      }
    }

    throw new Error('Player not found')
  }
}