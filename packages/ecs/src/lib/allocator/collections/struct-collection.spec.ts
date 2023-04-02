import { describe, expect } from 'vitest'
import { defineComponent } from '../../components/define-component'
import { Allocator } from '../allocator'
import { DataType } from '../data-type'
import { StructCollection } from './struct-collection'

const testComponent = defineComponent({
  a: DataType.u32,
  b: DataType.f32,
})

const complexComponent = defineComponent({
  id: [ DataType.u8, 16 ],
  slot: DataType.u8,
})

describe('StructCollection', () => {
  test('components', () => {
    expect(testComponent.__BYTE_LENGTH).toBe(8)
    expect(complexComponent.__BYTE_LENGTH).toBe(17)
  })
  test('Basic', () => {
    const allocator = new Allocator(1024, 16, 16)

    const structCollection = allocator.allocateStruct(StructCollection, 2, testComponent) as StructCollection<typeof testComponent.__SCHEMA>

    expect(structCollection.byteLength).toBe(8 + testComponent.__BYTE_LENGTH * 2)
    expect(StructCollection.calculateByteLength(2, testComponent.__BYTE_LENGTH)).toBe(8 + testComponent.__BYTE_LENGTH * 2)

    const ptr1 = structCollection.add()
    const accessor = structCollection.get(ptr1)

    accessor.a = 1
    accessor.b = 2

    expect(accessor.a).toBe(1)
    expect(accessor.b).toBe(2)

    const ptr2 = structCollection.add()
    const accessor2 = structCollection.get(ptr2)
    accessor2.a = 3
    accessor2.b = 4

    expect(accessor2.a).toBe(3)
    expect(accessor2.b).toBe(4)

    expect(structCollection.length).toBe(2)
    expect(structCollection.size).toBe(2)

    expect(structCollection.get(ptr1).a).toBe(1)
    expect(structCollection.get(ptr1).b).toBe(2)
  })
  test('Complex', () => {
    const allocator = new Allocator(1024, 16, 16)

    const structCollection = allocator.allocateStruct(StructCollection, 2, complexComponent) as StructCollection<typeof complexComponent.__SCHEMA>

    expect(structCollection.byteLength).toBe(8 + complexComponent.__BYTE_LENGTH * 2)
    expect(StructCollection.calculateByteLength(2, complexComponent.__BYTE_LENGTH)).toBe(8 + complexComponent.__BYTE_LENGTH * 2)

    const ptr1 = structCollection.add()
    const accessor = structCollection.get(ptr1)

    accessor.id.set([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ])
    accessor.slot = 2

    expect(accessor.id).toEqual(new Uint8Array([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]))
    expect(accessor.slot).toBe(2)

    const ptr2 = structCollection.add()
    const accessor2 = structCollection.get(ptr2)
    accessor2.id.set([ 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 ])
    accessor2.slot = 4

    expect(accessor2.id).toEqual(new Uint8Array([ 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 ]))
    expect(accessor2.slot).toBe(4)

    expect(structCollection.length).toBe(2)
    expect(structCollection.size).toBe(2)

    expect(structCollection.get(ptr1).id).toEqual(new Uint8Array([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]))
    expect(structCollection.get(ptr1).slot).toBe(2)
  })

  test('Resize', () => {
    const allocator = new Allocator(1024, 16, 16)

    const simpleCollection = allocator.allocateStruct(StructCollection, 2, testComponent) as StructCollection<typeof testComponent.__SCHEMA>
    const complexCollection = allocator.allocateStruct(StructCollection, 2, complexComponent) as StructCollection<typeof complexComponent.__SCHEMA>

    for (let i = 0; i < 100; i++) {
      const ptr = simpleCollection.add()
      const accessor = simpleCollection.get(ptr)
      accessor.a = i
      accessor.b = i * 2
    }
    expect(simpleCollection.length).toBe(100)
    expect(simpleCollection.size).toBe(128)

    for (let i = 0; i < 100; i++) {
      const ptr = complexCollection.add()
      const accessor = complexCollection.get(ptr)
      accessor.id.set(new Array(16).fill(i))
      accessor.slot = i
    }

    expect(complexCollection.length).toBe(100)
    expect(complexCollection.size).toBe(128)
  })
})