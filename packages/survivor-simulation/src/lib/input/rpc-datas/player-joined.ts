import { PlayerCharacter } from '../../features/player/data/player-character'

export class PlayerJoinedData {
  constructor(
    public readonly slot: number,
    public readonly character: PlayerCharacter,
  ) {
  }
}