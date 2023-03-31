import { describe, expect, test } from 'vitest'
import { Allocator } from '../allocator'
import { DataType } from '../data-type'
import { Array } from './array'

describe('Array', () => {
  test('Create/Get/Set', () => {
    const allocator = new Allocator(1024, 16, 16)
    const array = allocator.allocateStruct(Array, 4, DataType.u32)

    array.set(0, 1)
    array.set(1, 2)
    array.set(2, 3)
    array.set(3, 4)

    expect(array.get(0)).toBe(1)
    expect(array.get(1)).toBe(2)
    expect(array.get(2)).toBe(3)
    expect(array.get(3)).toBe(4)
  })

  test('OnResize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const array = allocator.allocateStruct(Array, 4, DataType.u32)

    array.set(0, 1)
    array.set(1, 2)
    array.set(2, 3)
    array.set(3, 4)

    allocator['resize'](allocator.heap.byteLength * 2)

    expect(array.get(0)).toBe(1)
    expect(array.get(1)).toBe(2)
    expect(array.get(2)).toBe(3)
    expect(array.get(3)).toBe(4)
  })

  test('Snapshot', () => {
    const allocator = new Allocator(1024, 16, 16)
    const array = allocator.allocateStruct(Array, 4, DataType.u32)

    array.set(0, 1)
    array.set(1, 2)
    array.set(2, 3)
    array.set(3, 4)

    const snapshot = allocator.createSnapshot()

    const allocator2 = new Allocator(1024, 16, 16)
    const array2 = allocator2.allocateStruct(Array, 4, DataType.u32)

    allocator2.applySnapshot(snapshot)

    expect(array2.get(0)).toBe(1)
    expect(array2.get(1)).toBe(2)
    expect(array2.get(2)).toBe(3)
    expect(array2.get(3)).toBe(4)
  })

  test('Snapshot with resize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const array = allocator.allocateStruct(Array, 4, DataType.u32)

    array.set(0, 1)
    array.set(1, 2)
    array.set(2, 3)
    array.set(3, 4)

    allocator['resize'](allocator.heap.byteLength * 2)

    const snapshot = allocator.createSnapshot()

    const allocator2 = new Allocator(1024, 16, 16)
    const array2 = allocator2.allocateStruct(Array, 4, DataType.u32)

    allocator2.applySnapshot(snapshot)

    expect(array2.get(0)).toBe(1)
    expect(array2.get(1)).toBe(2)
    expect(array2.get(2)).toBe(3)
    expect(array2.get(3)).toBe(4)
  })

  test('Out of bounds', () => {
    const allocator = new Allocator(1024, 16, 16)
    const array = allocator.allocateStruct(Array, 4, DataType.u32)

    array.set(0, 1)

    expect(() => array.get(4)).toThrow()
    expect(() => array.set(4, 1)).toThrow()
  })
})