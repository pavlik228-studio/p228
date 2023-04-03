import { InputHistory } from './input-history'
import { Rpc } from './rpc'

export class InputProvider {
  public readonly rpcHistory = new InputHistory()

  public getInvalidateTick(): number | undefined {
    return undefined
  }

  public setRpc(rpc: Rpc): void {
    this.rpcHistory.add(rpc)
    console.log(
      `setRpc: ${rpc.tick}, ${rpc.playerSlot}, ${rpc.rpc}, ${JSON.stringify(
        rpc.data,
      )}`,
    )
  }
}