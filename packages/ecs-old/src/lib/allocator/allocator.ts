import { Logger } from '../misc/logger';
import { DataType } from './data-type';
import {
  IMemoryBlockBufferLike,
  MEMORY_BLOCK_BUFFER_1,
  MEMORY_BLOCK_BUFFER_2,
} from './memory-block-buffer';
import { HeapTuples } from './structures/heap-tuples';
import { List } from './structures/list';

export class Allocator {
  private _byteLength: number;
  private readonly _systemMemory: number;
  private readonly _freeList: HeapTuples<IMemoryBlockBufferLike>;
  private readonly _usedList: HeapTuples<IMemoryBlockBufferLike>;
  private _freeSpace = 0;

  constructor(byteLength: number, systemListSize = 16) {
    const memoryBlockListSize = HeapTuples.calculateByteLength(
      DataType.u32,
      systemListSize,
      2
    );
    this._systemMemory = memoryBlockListSize * 2;
    this._byteLength = byteLength + this._systemMemory;
    this._freeSpace = this._byteLength;
    this._heap = new ArrayBuffer(this._byteLength);
    let offset = 0;
    this._freeList = new HeapTuples<IMemoryBlockBufferLike>(
      MEMORY_BLOCK_BUFFER_1,
      DataType.u32,
      systemListSize
    );
    this._freeList.allocate(offset, this._heap);
    offset += memoryBlockListSize;
    this._usedList = new HeapTuples<IMemoryBlockBufferLike>(
      MEMORY_BLOCK_BUFFER_1,
      DataType.u32,
      systemListSize
    );
    this._usedList.allocate(offset, this._heap);
    this._freeList.add(MEMORY_BLOCK_BUFFER_1.set(this._byteLength, 0));
    this.allocate(this._systemMemory, false);
  }

  private _heap: ArrayBuffer;

  public get heap(): ArrayBuffer {
    return this._heap;
  }

  public allocate(byteLength: number, reset = true): number {
    // byteLength should be a multiple of 8
    byteLength = Math.ceil(byteLength / 8) * 8;
    let block = this.findFreeBlock(byteLength);
    if (!block) {
      // throw new Error('Out of memory')
      this.resize();
      return this.allocate(byteLength, reset);
    }

    const addr = block.byteOffset;
    const blockIndex = this._freeList.indexOf(block.byteOffset, 1);

    if (block.byteLength === 688) debugger;

    if (block.byteLength === byteLength) {
      // block fits exactly, remove from free list
      this._freeList.remove(blockIndex);
    } else {
      // block is larger than requested, split and add remaining to free list
      const newBlock = MEMORY_BLOCK_BUFFER_1.set(
        block.byteLength - byteLength,
        addr + byteLength
      );
      this._freeList.set(blockIndex, newBlock);
    }

    this._usedList.add(MEMORY_BLOCK_BUFFER_1.set(byteLength, addr));

    this._freeSpace -= byteLength;

    if (!reset) return addr;

    // Reset allocated memory to 0
    new Uint8Array(this._heap, addr, byteLength).fill(0);

    return addr;
  }

  public free(addr: number): void {
    const block = this.findUsedBlock(addr);
    if (!block) {
      throw new Error(`Invalid address ${addr}`);
    }

    const blockIndex = this._usedList.indexOf(block.byteOffset, 1);

    this._usedList.remove(blockIndex);
    this.addFreeBlock(block);

    this._freeSpace += block.byteLength;
  }

  public resize(): void {
    const oldByteLength = this._byteLength;
    const newByteLength = oldByteLength * 2;
    const byteLengthDiff = newByteLength - this._byteLength;
    const memoryBlockListSize = HeapTuples.calculateByteLength(
      DataType.u32,
      this._freeList.size,
      2
    );
    const newHeap = new ArrayBuffer(newByteLength);

    let offset = 0;
    this._freeList.move(offset, newHeap);
    offset += memoryBlockListSize;
    this._usedList.move(offset, newHeap);

    new Uint8Array(newHeap).set(new Uint8Array(this._heap));
    this._heap = newHeap;

    this._freeSpace += byteLengthDiff;
    this.addFreeBlock(MEMORY_BLOCK_BUFFER_2.set(byteLengthDiff, oldByteLength));
    this._byteLength = newByteLength;
    Logger.log(
      `[allocator] resized heap ${oldByteLength} -> ${newByteLength} bytes`
    );
    this.logFreeSpace();
  }

  public allocateList(dataType: DataType, size: number): List {
    return new List(dataType, size, this);
  }

  public logFreeSpace(): void {
    Logger.log(
      '[allocator]',
      `FREE_SPACE:`,
      this._freeSpace,
      `FREE_BLOCKS:`,
      this._freeList.toJSON().reduce((acc, curr) => acc + curr.byteLength, 0),
      `USAGE: ${(
        ((this._byteLength - this._freeSpace) / this._byteLength) *
        100
      ).toFixed(1)}%`
    );
  }

  private findFreeBlock(size: number): IMemoryBlockBufferLike | undefined {
    // TODO: use buffer
    return this._freeList.find((blockSize) => blockSize >= size, 0);
  }

  private findUsedBlock(addr: number): IMemoryBlockBufferLike | undefined {
    // TODO: use buffer
    return this._usedList.find((blockOffset) => blockOffset === addr, 1);
  }

  private addFreeBlock(block: IMemoryBlockBufferLike): void {
    // find the index where the block should be inserted based on address order
    const index = this._freeList.findIndex(
      (blockOffset) => blockOffset > block.byteOffset,
      1
    );
    if (index === -1) {
      // block should be inserted at end of list
      this._freeList.add(block);
    } else {
      // block should be inserted before the block at the found index
      this._freeList.insertBefore(index, block);
    }

    // merge adjacent free blocks if possible
    for (let i = 0; i < this._freeList.length - 1; i++) {
      const curr = MEMORY_BLOCK_BUFFER_1.from(this._freeList.get(i));
      const next = MEMORY_BLOCK_BUFFER_2.from(this._freeList.get(i + 1));
      if (curr.byteOffset + curr.byteLength === next.byteOffset) {
        curr.byteLength += next.byteLength;
        this._freeList.set(i, curr);
        this._freeList.remove(i + 1);
        i--;
      }
    }
  }
}
