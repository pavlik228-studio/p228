import { MoveData } from './rpc-datas/move'
import { PlayerJoinedData } from './rpc-datas/player-joined'
import { SurvivorRpc } from './survivor-rpc'

export const SurvivorInputSchema = {
  [SurvivorRpc.PlayerJoined]: new PlayerJoinedData(0),
  [SurvivorRpc.Move]: new MoveData(0),
}