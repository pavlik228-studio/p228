export interface IMemoryBlockBufferLike {
  byteOffset: number;
  byteLength: number;
}

export class MemoryBlockBuffer implements IMemoryBlockBufferLike {
  constructor(public byteOffset = 0, public byteLength = 0) {}

  public set(byteLength: number, byteOffset: number) {
    this.byteOffset = byteOffset;
    this.byteLength = byteLength;

    return this;
  }

  public from(memoryBlockBuffer: IMemoryBlockBufferLike) {
    this.byteOffset = memoryBlockBuffer.byteOffset;
    this.byteLength = memoryBlockBuffer.byteLength;

    return this;
  }
}

export const MEMORY_BLOCK_BUFFER_1 = new MemoryBlockBuffer(0, 0);
export const MEMORY_BLOCK_BUFFER_2 = new MemoryBlockBuffer(0, 0);
export const MEMORY_BLOCK_BUFFER_3 = new MemoryBlockBuffer(0, 0);
