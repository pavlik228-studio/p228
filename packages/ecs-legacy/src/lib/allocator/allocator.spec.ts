import { describe, expect, test } from 'vitest';
import { Allocator } from './allocator';
import { DataType } from './data-type';
import { HeapTuples } from './structures/heap-tuples';

describe('allocator', () => {
  // test('Allocate/Resize', () => {
  //   const allocator = new Allocator(64, 16, 16)
  //   const expectedSystemSize =
  //     HeapTuples.calculateByteLength(DataType.u32, 16, 2) * 2
  //     + 16 * 4
  //   const overallSize = 64 + expectedSystemSize
  //   expect(expectedSystemSize).toBe(allocator['_systemMemory'])
  //   expect(allocator.heap.byteLength).toBe(overallSize)
  //
  //   const list_1 = allocator.allocateList(DataType.u8, 10)
  //   for (let i = 0; i < 10; i++) list_1.add(1)
  //   const list_2 = allocator.allocateList(DataType.u8, 10)
  //   for (let i = 0; i < 10; i++) list_2.add(2)
  //
  //   allocator.resize()
  //
  //   expect(allocator.heap.byteLength).toBe(overallSize * 2)
  //
  //   for (let i = 0; i < 10; i++) {
  //     expect(list_1.get(i)).toBe(1)
  //     expect(list_2.get(i)).toBe(2)
  //   }
  // })
  //
  // test('ListLegacy', () => {
  //   const allocator = new Allocator(64)
  //   expect(allocator.heap.byteLength).toBe(64 + allocator['_systemMemory'])
  //   const list = allocator.allocateList(DataType.u8, 10)
  //   allocator.allocateList(DataType.u8, 10)
  //   allocator.allocateList(DataType.u8, 20)
  //   allocator.allocateList(DataType.u8, 30)
  //   allocator.allocateList(DataType.u8, 40)
  //   allocator.allocateList(DataType.u8, 50)
  //   allocator.allocateList(DataType.u8, 150)
  //   allocator.allocateList(DataType.u8, 50)
  //
  //   expect(list.length).toBe(0)
  //   expect(list.add(2)).toBe(0)
  //   expect(list.length).toBe(1)
  //   expect(list.get(0)).toBe(2)
  //   expect(list.get(1)).toBe(undefined)
  //   expect(list.add(256)).toBe(1)
  //   expect(list.length).toBe(2)
  //   expect(list.get(1)).toBe(0)
  //   expect(list.add(10)).toBe(2)
  //
  //   list.remove(0)
  //   expect(list.length).toBe(2)
  //   expect(list.get(0)).toBe(10)
  //   expect(list.get(1)).toBe(0)
  //
  //   list.free()
  //   expect(() => list.length).toThrowError('Cannot read properties of null')
  //
  //   const list2 = allocator.allocateList(DataType.u8, 10)
  //   // Should reset memory values
  //   expect(list2.length).toBe(0)
  //
  //   for (let i = 0; i < 10; i++) {
  //     list2.add(i + 1)
  //   }
  //
  //   expect(list2.length).toBe(10)
  //
  //   list2.add(11)
  //
  //   expect(list2.length).toBe(11)
  //   expect(list2.size).toBe(20)
  //
  //   for (let i = 0; i < 11; i++) {
  //     expect(list2.get(i)).toBe(i + 1)
  //   }
  //
  //   const list3 = allocator.allocateList(DataType.u8, 10)
  //   expect(list3.length).toBe(0)
  //
  //   const snapshot = allocator.createSnapshot()
  //   expect(snapshot.byteLength).toBe(allocator.heap.byteLength)
  //   expect(snapshot).not.toBe(allocator.heap)
  //
  //   allocator.applySnapshot(snapshot)
  //   expect(allocator.heap.byteLength).toBe(snapshot.byteLength)
  //   expect(allocator.heap).toBe(snapshot)
  //   expect(list3['_heapView'].buffer).toBe(allocator.heap)
  //
  //   expect(list2.length).toBe(11)
  //   expect(list2.size).toBe(20)
  //   for (let i = 0; i < 11; i++) {
  //     expect(list2.get(i)).toBe(i + 1)
  //   }
  // })

  test('Snapshot aster resize', () => {
    const allocator = new Allocator(64, 16, 16);
    const list = allocator.allocateList(DataType.u8, 10);

    for (let i = 0; i < 10; i++) {
      list.add(99);
    }

    for (let i = 0; i < 10; i++) {
      expect(list.get(i)).toBe(99);
    }

    expect(list.ref.value).toBe(336);
    expect(list.length).toBe(10);

    // allocator.allocateList(DataType.u8, 50)
    //
    // for (let i = 0; i < 1000; i++) {
    //   list.add(88)
    // }
    //
    // expect(list.length).toBe(1010)
    // expect(list.ref.value).toBe(1800)

    // const snapshot = allocator.createSnapshot()
    //
    // const allocator2 = new Allocator(64, 16, 16)
    // const copyList = allocator2.allocateList(DataType.u8, 10)
    //
    // allocator2.applySnapshot(snapshot)
    //
    // expect(copyList.ref.value).toBe(list.ref.value)
    // expect(copyList.length).toBe(list.length)
    // expect(copyList.size).toBe(list.size)
    //
    // for (let i = 0; i < copyList.length; i++) {
    //   if (copyList.get(i) !== list.get(i)) {
    //     console.log('DIFFERENT', copyList.length, copyList.size, list.length, list.size)
    //     console.log(i, copyList.get(i), list.get(i))
    //   }
    //   expect(copyList.get(i)).toBe(list.get(i))
    // }
  });
});
