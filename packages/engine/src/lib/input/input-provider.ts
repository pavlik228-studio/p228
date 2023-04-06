import { SimulationWorld } from '../simulation-world'
import { InputHistory } from './input-history'
import { Rpc } from './rpc'

interface IInputSchema {
  // RPC type: RPC data
  [key: number]: unknown
}

export class InputProvider<TRPCSchema extends IInputSchema = IInputSchema> {
  public readonly rpcHistory = new InputHistory()
  protected _playerSlot = 1
  private _world!: SimulationWorld

  public get playerSlot(): number {
    return this._playerSlot
  }

  constructor(private readonly _schema: TRPCSchema = {} as TRPCSchema) {

  }

  public getInvalidateTick(): number | undefined {
    return undefined
  }

  public setRpc<TRpcId extends keyof TRPCSchema>(rpcId: TRpcId, data: TRPCSchema[TRpcId]): void {
    const rpc = this.createRpc(rpcId, data)
    this.rpcHistory.add(rpc)
    console.log(
      `setRpc: ${rpc.tick}, ${rpc.playerSlot}, ${rpc.rpc}, ${JSON.stringify(
        rpc.data,
      )}`,
    )
  }

  public setWorld(world: SimulationWorld): void {
    this._world = world
  }

  private createRpc<TRpcId extends keyof TRPCSchema>(rpcId: TRpcId, data: TRPCSchema[TRpcId]): Rpc {
    return new Rpc(this._world.tick + 1, Date.now(), this._playerSlot, Number(rpcId), data)
  }

  // public setRpc(rpc: Rpc): void {
  //   this.rpcHistory.add(rpc)
  //   console.log(
  //     `setRpc: ${rpc.tick}, ${rpc.playerSlot}, ${rpc.rpc}, ${JSON.stringify(
  //       rpc.data,
  //     )}`,
  //   )
  // }
}