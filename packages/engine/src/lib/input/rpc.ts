export class Rpc<TData = unknown> {
  constructor(
    public readonly tick: number,
    public readonly ts: number,
    public readonly playerSlot: number,
    public readonly rpc: number,
    public readonly data: TData,
  ) {
  }
}