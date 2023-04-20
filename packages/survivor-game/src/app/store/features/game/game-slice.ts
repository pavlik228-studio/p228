import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  IShopItem,
  IShopStateItem,
} from '../../../../../../survivor-simulation/src/lib/features/player/misc/shop-items'
import { GameScene } from '../../../game/survivor/game-scene'
import { initGameThunk } from './thunks/init-game.thunk'

export interface IGameState {
  gameScene: GameScene
  initialized: boolean
  goldBalance: number
  rerollPrice: number
  shopSlotsCount: number
  shopState: IShopStateItem[]
  weapons: IShopItem[]
  items: IShopItem[]
}

const initialState: IGameState = {
  goldBalance: 0,
  rerollPrice: 0,
  shopSlotsCount: 0,
  shopState: [],
  weapons: [],
  items: [],
  gameScene: undefined as any,
  initialized: false,
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameScene: (state, action: PayloadAction<GameScene>) => {
      const gameScene = action.payload

      return {
        ...initialState,
        gameScene,
      }
    },
    startGame: (state) => {
      state.gameScene.startGame()
    },
    buyShopItem: (state, action: PayloadAction<{ itemSlot: number }>) => {
      state.gameScene.buyShopItem(action.payload.itemSlot)

      return {
        ...state,
        shopState: state.gameScene.getStopState(),
        goldBalance: state.gameScene.getGoldBalance(),
        weapons: state.gameScene.getWeapons(),
        items: state.gameScene.getItems(),
      }
    },
    rerollShop: (state) => {
      state.gameScene.rerollShop()

      return {
        ...state,
        goldBalance: state.gameScene.getGoldBalance(),
        rerollPrice: state.gameScene.getRerollPrice(),
        shopState: state.gameScene.getStopState(),
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initGameThunk.fulfilled, (state, action) => {
      return {
        ...state,
        initialized: true,
        goldBalance: action.payload.goldBalance,
        rerollPrice: action.payload.rerollPrice,
        shopState: action.payload.shopState,
        shopSlotsCount: action.payload.shopSlotsCount,
      }
    })
  },
})

export const {
  setGameScene,
  startGame,
  buyShopItem,
  rerollShop
} = gameSlice.actions

export default gameSlice.reducer