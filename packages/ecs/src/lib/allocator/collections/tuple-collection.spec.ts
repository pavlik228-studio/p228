import { describe, expect, test } from 'vitest'
import { Allocator } from '../allocator'
import { DataType } from '../data-type'
import { TupleCollection } from './tuple-collection'

describe('TupleCollection', () => {
  test('Create', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = new TupleCollection(allocator, 2, 16)
    const byteLength = TupleCollection.calculateByteLength(16, 2, DataType.u32)
    tupleCollection.allocate(allocator.heap, 256)

    expect(tupleCollection.byteLength).toBe(byteLength)
    expect(tupleCollection.length).toBe(0)
  })

  test('Get/Set', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = new TupleCollection(allocator, 2, 16)
    tupleCollection.allocate(allocator.heap, 340)

    tupleCollection.add([1, 2])

    expect(tupleCollection['_heapView'].buffer).toBe(allocator.heap)
    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toBe(undefined)
    expect(tupleCollection.length).toBe(1)

    tupleCollection.set(0, [3, 4])

    expect(tupleCollection.get(0)).toEqual([3, 4])
    expect(tupleCollection.length).toBe(1)
  })

  test('Remove', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = new TupleCollection(allocator, 2, 16)
    tupleCollection.allocate(allocator.heap, 340)

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])
    tupleCollection.add([7, 8])

    expect(tupleCollection.length).toBe(4)

    tupleCollection.remove(1)

    expect(tupleCollection.length).toBe(3)
    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toEqual([5, 6])
    expect(tupleCollection.get(2)).toEqual([7, 8])
    expect(tupleCollection.get(3)).toBe(undefined)

    tupleCollection.remove(tupleCollection.length - 1)

    expect(tupleCollection.length).toBe(2)
    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toEqual([5, 6])
    expect(tupleCollection.get(2)).toBe(undefined)

    tupleCollection.remove(0)

    expect(tupleCollection.length).toBe(1)
    expect(tupleCollection.get(0)).toEqual([5, 6])
  })

  test('Find/IndexOf', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = new TupleCollection(allocator, 2, 16)
    tupleCollection.allocate(allocator.heap, 340)

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])
    tupleCollection.add([7, 8])

    expect(tupleCollection.length).toBe(4)

    expect(tupleCollection.indexOf(2, 1)).toBe(0)
    expect(tupleCollection.indexOf(3, 0)).toBe(1)
    expect(tupleCollection.indexOf(4, 1)).toBe(1)
    expect(tupleCollection.indexOf(7, 0)).toBe(3)
    expect(tupleCollection.indexOf(8, 1)).toBe(3)

    expect(tupleCollection.find((value) => value === 2, 1)).toEqual([1, 2])
    expect(tupleCollection.find((value) => value === 3, 0)).toEqual([3, 4])

    expect(tupleCollection.findIndex((value) => value === 2, 1)).toBe(0)
    expect(tupleCollection.findIndex((value) => value === 3, 0)).toBe(1)
  })

  test('InsertBefore', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = new TupleCollection(allocator, 2, 16)
    tupleCollection.allocate(allocator.heap, 340)

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])

    tupleCollection.insertBefore(1, [7, 8])

    expect(tupleCollection.length).toBe(4)

    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toEqual([7, 8])
    expect(tupleCollection.get(2)).toEqual([3, 4])
    expect(tupleCollection.get(3)).toEqual([5, 6])
  })

  test('OnResize', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = allocator.allocateLazyStruct(TupleCollection, 2, 16)
    const oldHeap = tupleCollection['_heapView']

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])

    allocator['resize'](allocator.heap.byteLength * 2)

    expect(tupleCollection['_heapView']).not.toBe(oldHeap)
    expect(tupleCollection['_heapView'].buffer).toBe(allocator.heap)
    expect(tupleCollection.length).toBe(3)
    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toEqual([3, 4])
    expect(tupleCollection.get(2)).toEqual([5, 6])
  })

  test('Resize', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = allocator.allocateLazyStruct(TupleCollection, 2, 4)

    const oldHeap = tupleCollection['_heapView']

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])
    tupleCollection.add([7, 8])

    expect(tupleCollection.length).toBe(4)

    tupleCollection.add([9, 10])

    expect(tupleCollection.length).toBe(5)
    expect(tupleCollection['_heapView']).not.toBe(oldHeap)

    expect(tupleCollection.get(0)).toEqual([1, 2])
    expect(tupleCollection.get(1)).toEqual([3, 4])
    expect(tupleCollection.get(2)).toEqual([5, 6])
    expect(tupleCollection.get(3)).toEqual([7, 8])
  })

  test('Snapshots', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = allocator.allocateLazyStruct(TupleCollection, 2, 4)

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])
    tupleCollection.add([7, 8])

    const snapshot = allocator.createSnapshot()
    const allocator2 = new Allocator(1024)
    const tupleCollection2 = allocator2.allocateLazyStruct(TupleCollection, 2, 4)

    allocator2.applySnapshot(snapshot)

    expect(allocator2.heap).not.toBe(allocator.heap)
    expect(tupleCollection2['_heapView'].buffer).not.toBe(allocator.heap)
    expect(tupleCollection2.length).toBe(4)
    expect(tupleCollection2.get(0)).toEqual([1, 2])
    expect(tupleCollection2.get(1)).toEqual([3, 4])
    expect(tupleCollection2.get(2)).toEqual([5, 6])
    expect(tupleCollection2.get(3)).toEqual([7, 8])
  })

  test('Snapshots and Resize', () => {
    const allocator = new Allocator(1024)
    const tupleCollection = allocator.allocateLazyStruct(TupleCollection, 2, 4)
    const initialPtr = tupleCollection.ptr.value

    tupleCollection.add([1, 2])
    tupleCollection.add([3, 4])
    tupleCollection.add([5, 6])
    tupleCollection.add([7, 8])
    tupleCollection.add([9, 10])

    const newPtr = tupleCollection.ptr.value

    expect(initialPtr).not.toBe(tupleCollection.ptr.value)
    expect(tupleCollection.length).toBe(5)
    expect(tupleCollection.size).toBe(8)

    const snapshot = allocator.createSnapshot()

    const allocator2 = new Allocator(1024)
    const tupleCollection2 = allocator2.allocateLazyStruct(TupleCollection, 2, 4)

    expect(initialPtr).toBe(tupleCollection2.ptr.value)

    allocator2.applySnapshot(snapshot)

    expect(initialPtr).not.toBe(tupleCollection2.ptr.value)
    expect(tupleCollection2.ptr.value).toBe(newPtr)
    expect(allocator2.heap).not.toBe(allocator.heap)
    expect(tupleCollection2['_heapView'].buffer).not.toBe(allocator.heap)
    expect(tupleCollection2.length).toBe(5)
    expect(tupleCollection2.get(0)).toEqual([1, 2])
    expect(tupleCollection2.get(1)).toEqual([3, 4])
    expect(tupleCollection2.get(2)).toEqual([5, 6])
    expect(tupleCollection2.get(3)).toEqual([7, 8])
    expect(tupleCollection2.get(4)).toEqual([9, 10])
  })
})