import { DataType, defineSingletonComponent } from '@p228/ecs'

export enum GameplayStage {
  Game,
  Shop,
}

export const Gameplay = defineSingletonComponent({
  currentWave: DataType.u8,
  itemsLevel: DataType.u8,
  stage: DataType.u8,
}, (raw) => {
  return {
    get currentWave(): number {
      return raw.currentWave[0]
    },
    set currentWave(value: number) {
      raw.currentWave[0] = value
    },
    get itemsLevel(): number {
      return raw.itemsLevel[0]
    },
    set itemsLevel(value: number) {
      raw.itemsLevel[0] = value
    },
    get stage(): GameplayStage {
      return raw.stage[0]
    },
    set stage(value: GameplayStage) {
      raw.stage[0] = value
    },
  }
})