import { createAsyncThunk } from '@reduxjs/toolkit'
import { PlayerCharacter } from '../../../../../../../survivor-simulation/src/lib/features/player/data/player-character'
import type { RootState } from '../../../index'

export const initGameThunk = createAsyncThunk(
  'game/initGame',
  async (character: PlayerCharacter, thunkAPI) => {
    const { game } = thunkAPI.getState() as RootState

    await game.gameScene.initializeGame(character)

    return {
      goldBalance: game.gameScene.getGoldBalance(),
      rerollPrice: game.gameScene.getRerollPrice(),
      shopState: game.gameScene.getStopState(),
      shopSlotsCount: game.gameScene.getShopSlotsCount(),
    }
  })