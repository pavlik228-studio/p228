import { describe, expect } from 'vitest'
import { ComponentSchema } from '../../components/component-schema'
import { Allocator } from '../allocator'
import { DataType } from '../data-type'
import { List } from './list'
import { StructCollection } from './struct-collection'

class TestComponent extends ComponentSchema {
  public registerSchema() {
    return {
      a: DataType.u8,
      lol: DataType.u8,
      kek: DataType.u16,
      cheburek: DataType.u32,
    }
  }
}

const testComponent = new TestComponent(1)

describe('StructCollection', () => {
  test('Basic', () => {
    const allocator = new Allocator(1024, 16, 16)
    const structCollection = allocator.allocateStruct(StructCollection, 4, testComponent) as unknown as StructCollection<ReturnType<TestComponent['registerSchema']>>

    const index = structCollection.add()
    const test = structCollection.get(index)

    test.a = 1
    test.lol = 2
    test.kek = 3
    test.cheburek = 4

    expect(test.a).toBe(1)
    expect(test.lol).toBe(2)
    expect(test.kek).toBe(3)
    expect(test.cheburek).toBe(4)

    const index2 = structCollection.add()
    const test2 = structCollection.get(index2)

    expect(test2.a).toBe(0)
    expect(test2.lol).toBe(0)
    expect(test2.kek).toBe(0)
    expect(test2.cheburek).toBe(0)

    test2.a = 5
    test2.lol = 6
    test2.kek = 7
    test2.cheburek = 8

    expect(test).toBe(test2)
    expect(test2.a).toBe(5)
    expect(test2.lol).toBe(6)
    expect(test2.kek).toBe(7)
    expect(test2.cheburek).toBe(8)

    const test2Copy = test2.copy()

    expect(test2Copy).not.toBe(test2)

    test2.__index = 0

    expect(test2Copy.a).toBe(5)
    expect(test2.a).toBe(1)
  })

  test('Resize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list1 = allocator.allocateStruct(List, 10)
    const structCollection = allocator.allocateStruct(StructCollection, 4, testComponent) as unknown as StructCollection<ReturnType<TestComponent['registerSchema']>>
    const list2 = allocator.allocateStruct(List, 10)
    const originalPtr = structCollection.ptr.value

    for (let i = 0; i < 10; i++) {
      list1.add(88)
      list2.add(88)
    }

    for (let i = 0; i < 4; i++) {
      const index = structCollection.add()
      const test = structCollection.get(index)

      test.a = i * 10
      test.lol = i * 10
      test.kek = i * 10
      test.cheburek = i * 10
    }

    expect(structCollection.length).toBe(4)
    expect(structCollection.size).toBe(4)

    const triggersResize = structCollection.add()

    for (let i = 0; i < 10; i++) {
      list1.add(88)
      list2.add(88)
    }

    expect(structCollection.length).toBe(5)
    expect(structCollection.size).toBe(8)
    expect(structCollection.ptr.value).not.toBe(originalPtr)

    for (let i = 0; i < 4; i++) {
      const test = structCollection.get(i)

      expect(test.a).toBe(i * 10)
      expect(test.lol).toBe(i * 10)
      expect(test.kek).toBe(i * 10)
      expect(test.cheburek).toBe(i * 10)
    }

    const test = structCollection.get(triggersResize)

    expect(test.a).toBe(0)
    expect(test.lol).toBe(0)
    expect(test.kek).toBe(0)
    expect(test.cheburek).toBe(0)

    for (let i = 0; i < 10; i++) {
      expect(list1.get(i)).toBe(88)
      expect(list2.get(i)).toBe(88)
    }
  })

  test('Snapshot', () => {
    const allocator = new Allocator(1024, 16, 16)
    const structCollection = allocator.allocateStruct(StructCollection, 4, testComponent) as unknown as StructCollection<ReturnType<TestComponent['registerSchema']>>

    const index = structCollection.add()
    const test = structCollection.get(index)

    test.a = 1
    test.lol = 2
    test.kek = 3
    test.cheburek = 4

    const oldHeap = allocator['heap']

    allocator['resize'](1024 * 2)
    const snapshot = allocator.createSnapshot()

    new Uint8Array(oldHeap).fill(0)

    expect(test.a).toBe(0)
    expect(test.lol).toBe(0)

    const test2 = structCollection.get(index)

    expect(test2.a).toBe(1)
    expect(test2.lol).toBe(2)
    expect(test2.kek).toBe(3)
    expect(test2.cheburek).toBe(4)

    const allocator2 = new Allocator(1024, 16, 16)
    const structCollection2 = allocator2.allocateStruct(StructCollection, 4, testComponent) as unknown as StructCollection<ReturnType<TestComponent['registerSchema']>>

    allocator2.applySnapshot(snapshot)

    const test3 = structCollection2.get(index)

    expect(test3.a).toBe(1)
    expect(test3.lol).toBe(2)
    expect(test3.kek).toBe(3)
    expect(test3.cheburek).toBe(4)

  })
})