import { describe, expect } from 'vitest'
import { Allocator } from './allocator'
import { TupleCollection } from './collections/tuple-collection'
import { DataType } from './data-type'
import { Registry } from './registry'

describe('Allocator', () => {
  test('Create', () => {
    const allocator = new Allocator(1024, 16, 16)
    const regSize = Registry.calculateSize(16)
    const sysSize = TupleCollection.calculateByteLength(16, 2, DataType.u32) * 2
    expect(allocator.heap.byteLength).toBe(1024 + regSize + sysSize)

    const freeMemBlocks = allocator['_freeMemList'].toJSON()
    const freeMemSize = freeMemBlocks.reduce((acc, block) => acc + block[0], 0)
    expect(freeMemSize).toBe(1024)

    const usedMemBlocks = allocator['_usedMemList'].toJSON()
    const usedMemSize = usedMemBlocks.reduce((acc, block) => acc + block[0], 0)
    expect(usedMemSize).toBe(sysSize)
  })

  test('Allocate', () => {
    const allocator = new Allocator(1024, 16, 16)
    const regSize = Registry.calculateSize(16)
    const sysSize = TupleCollection.calculateByteLength(16, 2, DataType.u32) * 2
    const expectedOffset = regSize + sysSize

    const tupleCollection = new TupleCollection(allocator, 2, 16)
    const tupleCollectionByteLength = TupleCollection.calculateByteLength(16, 2, DataType.u32)
    const tupleCollectionPtr = allocator.allocate(tupleCollectionByteLength)
    const freeMemBlocks = allocator['_freeMemList'].toJSON()
    const freeMemSize = freeMemBlocks.reduce((acc, block) => acc + block[0], 0)
    const usedMemBlocks = allocator['_usedMemList'].toJSON()
    const usedMemSize = usedMemBlocks.reduce((acc, block) => acc + block[0], 0)

    tupleCollection.allocate(allocator.heap, tupleCollectionPtr)

    expect(tupleCollectionPtr).toBe(expectedOffset)
    expect(tupleCollection.byteLength).toBe(tupleCollectionByteLength)
    expect(freeMemSize).toBe(1024 - tupleCollectionByteLength)
    expect(usedMemSize).toBe(sysSize + tupleCollectionByteLength)
  })

  test('Resize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const regSize = Registry.calculateSize(16)
    const sysSize = TupleCollection.calculateByteLength(16, 2, DataType.u32) * 2
    const expectedOffset = regSize + sysSize
    const byteLength = 1024 + expectedOffset

    const tupleCollection = new TupleCollection(allocator, 2, 16)
    const tupleCollectionByteLength = TupleCollection.calculateByteLength(16, 2, DataType.u32)
    const tupleCollectionPtr = allocator.allocate(tupleCollectionByteLength)
    const freeMemBlocks = allocator['_freeMemList'].toJSON()
    const freeMemSize = freeMemBlocks.reduce((acc, block) => acc + block[0], 0)
    const usedMemBlocks = allocator['_usedMemList'].toJSON()
    const usedMemSize = usedMemBlocks.reduce((acc, block) => acc + block[0], 0)

    tupleCollection.allocate(allocator.heap, tupleCollectionPtr)

    const expectedFreeMem = 1024 - tupleCollectionByteLength
    const expectedUsedMem = sysSize + tupleCollectionByteLength

    expect(tupleCollectionPtr).toBe(expectedOffset)
    expect(tupleCollection.byteLength).toBe(tupleCollectionByteLength)
    expect(freeMemSize).toBe(expectedFreeMem)
    expect(usedMemSize).toBe(expectedUsedMem)

    allocator['resize'](allocator.heap.byteLength * 2)
    const newFreeMemBlocks = allocator['_freeMemList'].toJSON()
    const newFreeMemSize = newFreeMemBlocks.reduce((acc, block) => acc + block[0], 0)
    const newUsedMemBlocks = allocator['_usedMemList'].toJSON()
    const newUsedMemSize = newUsedMemBlocks.reduce((acc, block) => acc + block[0], 0)

    expect(newFreeMemSize).toBe(expectedFreeMem + byteLength)
    expect(newUsedMemSize).toBe(expectedUsedMem)
    expect(allocator.heap.byteLength).toBe((expectedOffset + 1024) * 2)
  })

  test('Allocate Lazy Structure', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = allocator.allocateLazyStruct(TupleCollection, 2, 16)
    const regSize = Registry.calculateSize(16)
    const sysSize = TupleCollection.calculateByteLength(16, 2, DataType.u32) * 2
    const expectedOffset = regSize + sysSize

    expect(tupleCollection).toBeInstanceOf(TupleCollection)
    expect(tupleCollection.byteLength).toBe(TupleCollection.calculateByteLength(16, 2, DataType.u32))
    expect(tupleCollection.ptr.value).toBe(expectedOffset)
    expect(tupleCollection['_heapView'].buffer).toBe(allocator.heap)
  })
})