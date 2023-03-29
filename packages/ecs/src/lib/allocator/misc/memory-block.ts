// 0 - is byteLength
// 1 - is byteOffset
export type IRawMemoryBlock = Array<number>

export class MemoryBlock {
  private readonly _raw = new Array<number>(2)
  constructor(
    public byteLength = 0,
    public byteOffset = 0,
  ) {}

  public set(byteLength: number, byteOffset: number): this {
    this.byteLength = byteLength
    this.byteOffset = byteOffset

    return this
  }

  public fromRaw(raw: IRawMemoryBlock): this {
    this.byteLength = raw[0]
    this.byteOffset = raw[1]

    return this
  }

  public toRaw(): IRawMemoryBlock {
    this._raw[0] = this.byteLength
    this._raw[1] = this.byteOffset

    return this._raw
  }
}

export const MEM_BLOCK_BUFFER_1 = new MemoryBlock()
export const MEM_BLOCK_BUFFER_2 = new MemoryBlock()
export const MEM_BLOCK_BUFFER_3 = new MemoryBlock()