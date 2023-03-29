import { describe, expect, test } from 'vitest';
import { DataType } from '../data-type';
import {
  IMemoryBlockBufferLike,
  MEMORY_BLOCK_BUFFER_1,
  MemoryBlockBuffer,
} from '../memory-block-buffer';
import { HeapTuples } from './heap-tuples';

describe('HeapTuples', () => {
  test('Basic', () => {
    const heap = new ArrayBuffer(272);
    const tuples = new HeapTuples<IMemoryBlockBufferLike>(
      new MemoryBlockBuffer(),
      DataType.u32,
      3
    );
    tuples.allocate(0, heap);

    tuples.add(MEMORY_BLOCK_BUFFER_1.set(1, 1));

    expect(tuples.length).toBe(1);
    expect(tuples.get(0)).toEqual(MEMORY_BLOCK_BUFFER_1.set(1, 1));

    tuples.add(MEMORY_BLOCK_BUFFER_1.set(2, 2));
    expect(tuples.length).toBe(2);
    expect(tuples.get(1)).toEqual(MEMORY_BLOCK_BUFFER_1.set(2, 2));

    tuples.insertBefore(1, MEMORY_BLOCK_BUFFER_1.set(3, 3));
    expect(tuples.length).toBe(3);
    expect(tuples.get(0)).toEqual(MEMORY_BLOCK_BUFFER_1.set(1, 1));
    expect(tuples.get(1)).toEqual(MEMORY_BLOCK_BUFFER_1.set(3, 3));
    expect(tuples.get(2)).toEqual(MEMORY_BLOCK_BUFFER_1.set(2, 2));

    tuples.remove(1);
    expect(tuples.length).toBe(2);
    expect(tuples.get(1)).toEqual(MEMORY_BLOCK_BUFFER_1.set(2, 2));
  });

  test('Move other heap', () => {
    const heap = new ArrayBuffer(272);
    const tuples = new HeapTuples<IMemoryBlockBufferLike>(
      new MemoryBlockBuffer(),
      DataType.u32,
      3
    );
    tuples.allocate(0, heap);
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(1, 1));
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(2, 2));
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(3, 3));

    expect(tuples['_heapView'].buffer).toBe(heap);

    const newHeap = new ArrayBuffer(272 * 2);
    tuples.move(0, newHeap);

    expect(tuples['_heapView'].buffer).toBe(newHeap);

    const oldHeapView = new Uint8Array(heap);
    for (let i = 0; i < oldHeapView.length; i++) {
      oldHeapView[i] = 0;
    }

    expect(tuples.length).toBe(3);
    expect(tuples.get(0)).toEqual(MEMORY_BLOCK_BUFFER_1.set(1, 1));
    expect(tuples.get(1)).toEqual(MEMORY_BLOCK_BUFFER_1.set(2, 2));
    expect(tuples.get(2)).toEqual(MEMORY_BLOCK_BUFFER_1.set(3, 3));
  });

  test('index of / find', () => {
    const heap = new ArrayBuffer(272);
    const tuples = new HeapTuples<IMemoryBlockBufferLike>(
      new MemoryBlockBuffer(),
      DataType.u32,
      3
    );
    tuples.allocate(0, heap);
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(1, 10));
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(2, 20));
    tuples.add(MEMORY_BLOCK_BUFFER_1.set(3, 30));

    expect(tuples.indexOf(1, 0)).toBe(0);
    expect(tuples.indexOf(10, 1)).toBe(0);

    expect(tuples.indexOf(3, 0)).toBe(2);
    expect(tuples.indexOf(456, 1)).toBe(-1);

    expect(tuples.find((v) => v > 10, 1)).toEqual(
      MEMORY_BLOCK_BUFFER_1.set(2, 20)
    );
    expect(tuples.find((v) => v > 100, 1)).toBe(undefined);

    expect(tuples.findIndex((v) => v > 10, 1)).toBe(1);
    expect(tuples.findIndex((v) => v > 100, 1)).toBe(-1);
  });
});
