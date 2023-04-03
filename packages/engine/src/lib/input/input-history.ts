import { Rpc } from './rpc'

export interface InputHistoryTickData {
  [playerSlot: number]: Rpc[]
}

const EMPTY_DATA = new Array<Rpc>()

export class InputHistory {
  private readonly _history = new Map<number, InputHistoryTickData>()

  public add(rpc: Rpc): void {
    let tickData = this._history.get(rpc.tick)
    if (!tickData) {
      tickData = {}
      this._history.set(rpc.tick, tickData)
    }

    let playerData = tickData[rpc.playerSlot]
    if (!playerData) {
      playerData = []
      tickData[rpc.playerSlot] = playerData
    }

    playerData.push(rpc)
    playerData.sort(sortRpcsByTs)
  }

  public getPlayerRPCs(tick: number, playerSlot: number): Rpc[] {
    const tickData = this._history.get(tick)
    if (!tickData) return EMPTY_DATA

    const playerData = tickData[playerSlot]
    if (!playerData) return EMPTY_DATA

    return playerData
  }

  public getPlayerRPCByType(tick: number, playerSlot: number, rpcType: number, out: Rpc[]): Rpc[] {
    const tickData = this._history.get(tick)
    if (!tickData) return EMPTY_DATA

    const playerData = tickData[playerSlot]
    if (!playerData) return EMPTY_DATA

    out.length = 0

    for (const rpc of playerData) {
      if (rpc.rpc !== rpcType) continue
      out.push(rpc)
    }

    return out
  }
}

function sortRpcsByTs(a: Rpc, b: Rpc): number {
  return a.ts - b.ts
}