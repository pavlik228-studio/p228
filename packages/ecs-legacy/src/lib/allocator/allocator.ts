import { Logger } from '../misc/logger';
import { DataType } from './data-type';
import {
  IMemoryBlockBufferLike,
  MEMORY_BLOCK_BUFFER_1,
  MEMORY_BLOCK_BUFFER_2,
} from './memory-block-buffer';
import { RefAccessor } from './ref-accessor';
import { IAllocatorStructure } from './structures/allocator-structure.interface';
import { HeapTuples } from './structures/heap-tuples';
import { List } from './structures/list';

export class Allocator {
  private _byteLength: number;
  private readonly _systemMemory: number;
  private readonly _freeList: HeapTuples<IMemoryBlockBufferLike>;
  private readonly _usedList: HeapTuples<IMemoryBlockBufferLike>;
  private readonly _structures = new Array<IAllocatorStructure>();
  private _refsCount = 0;
  private _refsDataView: DataView;

  public get refsDataView(): DataView {
    return this._refsDataView;
  }

  constructor(
    byteLength: number,
    systemListSize = 16,
    private readonly _registrySize = 16
  ) {
    this._registrySize = Math.max(Math.ceil(this._registrySize / 8) * 8, 16);
    const registryByteLength = this._registrySize * RefAccessor.byteLength;
    const memoryBlockListSize = HeapTuples.calculateByteLength(
      DataType.u32,
      systemListSize,
      2
    );
    this._systemMemory = memoryBlockListSize * 2 + registryByteLength;
    this._byteLength = byteLength + this._systemMemory;
    this._heap = new ArrayBuffer(this._byteLength);
    let offset = 0;
    this._refsDataView = new DataView(this._heap, offset, registryByteLength);
    offset += registryByteLength;
    this._freeList = new HeapTuples<IMemoryBlockBufferLike>(
      MEMORY_BLOCK_BUFFER_1,
      DataType.u32,
      systemListSize,
      offset,
      this
    );
    offset += memoryBlockListSize;
    this._usedList = new HeapTuples<IMemoryBlockBufferLike>(
      MEMORY_BLOCK_BUFFER_1,
      DataType.u32,
      systemListSize,
      offset,
      this
    );
    this._freeList.add(MEMORY_BLOCK_BUFFER_1.set(this._byteLength, 0));
    // offset += memoryBlockListSize
    this.allocate(this._systemMemory, false);
  }

  private _heap: ArrayBuffer;

  public get heap(): ArrayBuffer {
    return this._heap;
  }

  public createSnapshot(): ArrayBuffer {
    return this._heap.slice(0);
  }

  public applySnapshot(snapshot: ArrayBuffer): void {
    console.log('applySnapshot', snapshot.byteLength, this._byteLength);
    this._refsDataView = new DataView(
      snapshot,
      this._refsDataView.byteOffset,
      this._refsDataView.byteLength
    );
    for (const structure of this._structures) {
      structure.transfer(snapshot);
    }

    this._heap = snapshot;
    this._byteLength = snapshot.byteLength;
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
  }

  public resize(): void {
    const oldByteLength = this._byteLength;
    const newByteLength = oldByteLength * 2;
    const byteLengthDiff = newByteLength - this._byteLength;
    const newHeap = new ArrayBuffer(newByteLength);

    this._refsDataView = new DataView(
      newHeap,
      this._refsDataView.byteOffset,
      this._refsDataView.byteLength
    );
    this._freeList.transfer(newHeap);
    this._usedList.transfer(newHeap);

    new Uint8Array(newHeap).set(new Uint8Array(this._heap));
    this._heap = newHeap;

    this.addFreeBlock(MEMORY_BLOCK_BUFFER_2.set(byteLengthDiff, oldByteLength));
    this._byteLength = newByteLength;
    Logger.log(
      `[allocator] resized heap ${oldByteLength} -> ${newByteLength} bytes`
    );

    this.logFreeSpace();
  }

  public allocateList(dataType: DataType, size: number): List {
    const list = new List(dataType, size, this);
    this._structures.push(list);
    return list;
  }

  public createRef(): RefAccessor {
    const byteOffset = this._refsCount * RefAccessor.byteLength;
    this._refsCount++;

    return new RefAccessor(byteOffset, this);
  }

  public logFreeSpace(): void {
    const freeSpace = this._freeList
      .toJSON()
      .reduce((acc, curr) => acc + curr.byteLength, 0);
    Logger.log(
      '[allocator]',
      `FREE_BLOCKS:`,
      `USAGE: ${(
        ((this._byteLength - freeSpace) / this._byteLength) *
        100
      ).toFixed(1)}%`
    );
  }

  private findFreeBlock(size: number): IMemoryBlockBufferLike | undefined {
    return this._freeList.find((blockSize) => blockSize >= size, 0);
  }

  private findUsedBlock(addr: number): IMemoryBlockBufferLike | undefined {
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
