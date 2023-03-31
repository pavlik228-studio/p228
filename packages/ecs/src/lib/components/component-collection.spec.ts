import { describe, expect, test } from 'vitest'
import { Allocator } from '../allocator/allocator'
import { DataType } from '../allocator/data-type'
import { ComponentCollection } from './component-collection'
import { ComponentSchema } from './component-schema'
import { IFixedList } from './component.types'

class SimpleComponent extends ComponentSchema {
  public registerSchema() {
    return {
      a: DataType.i32,
      b: DataType.u32,
    }
  }
}

export class ComplexComponent extends ComponentSchema {
  public registerSchema() {
    return {
      x: DataType.i32,
      y: [ DataType.u32, 4 ] as IFixedList,
      z: DataType.u32,
    }
  }
}

const simpleComponent = new SimpleComponent(1)
const complexComponent = new ComplexComponent(2)

describe('ComponentCollection', () => {
  test('Basic', () => {
    const allocator = new Allocator(1024, 16, 16)
    const simpleComponentCollection = new ComponentCollection(allocator, simpleComponent, 10, 10) as unknown as ComponentCollection<ReturnType<SimpleComponent['registerSchema']>>

    const entityRef = 0
    const simpleComponentData = simpleComponentCollection.add(entityRef)
    simpleComponentData.a = 1
    simpleComponentData.b = 2

    const data = simpleComponentCollection.get(entityRef)

    expect(data.a).toBe(1)
    expect(data.b).toBe(2)
    expect(data.__index).toBe(0)
    expect(data).toBe(simpleComponentData)

    const entityRef2 = 1
    const simpleComponentData2 = simpleComponentCollection.add(entityRef2)
    simpleComponentData2.a = 3
    simpleComponentData2.b = 4

    expect(simpleComponentData).toBe(simpleComponentData2)
    expect(simpleComponentData2.a).toBe(3)
    expect(simpleComponentData2.b).toBe(4)
    const data2 = simpleComponentCollection.get(entityRef)
    expect(data2.a).toBe(1)
    expect(data2.b).toBe(2)
  })

  test('Complex', () => {
    const allocator = new Allocator(1024, 16, 16)
    const complexComponentCollection = new ComponentCollection(allocator, complexComponent, 10, 10) as unknown as ComponentCollection<ReturnType<ComplexComponent['registerSchema']>>

    const entityRef = 0
    const complexComponentData = complexComponentCollection.add(entityRef)
    complexComponentData.x = 1
    complexComponentData.y[0] = 2
    complexComponentData.y[1] = 3
    complexComponentData.y[2] = 4
    complexComponentData.y[3] = 5
    complexComponentData.z = 6

    const data = complexComponentCollection.get(entityRef)

    expect(data.x).toBe(1)
    expect(data.y[0]).toBe(2)
    expect(data.y[1]).toBe(3)
    expect(data.y[2]).toBe(4)
    expect(data.y[3]).toBe(5)
    expect(data.z).toBe(6)
    expect(data.__index).toBe(0)
    expect(data).toBe(complexComponentData)

    const entityRef2 = 1
    const complexComponentData2 = complexComponentCollection.add(entityRef2)
    complexComponentData2.x = 7
    complexComponentData2.y[0] = 8
    complexComponentData2.y[1] = 9
    complexComponentData2.y[2] = 10
    complexComponentData2.y[3] = 11
    complexComponentData2.z = 12

    expect(complexComponentData).toBe(complexComponentData2)
    expect(complexComponentData2.x).toBe(7)
    expect(complexComponentData2.y[0]).toBe(8)
    expect(complexComponentData2.y[1]).toBe(9)
    expect(complexComponentData2.y[2]).toBe(10)
    expect(complexComponentData2.y[3]).toBe(11)
    expect(complexComponentData2.z).toBe(12)
    const data2 = complexComponentCollection.get(entityRef)
    expect(data2.x).toBe(1)
    expect(data2.y[0]).toBe(2)
    expect(data2.y[1]).toBe(3)
    expect(data2.y[2]).toBe(4)
    expect(data2.y[3]).toBe(5)
  })

  test('Remove', () => {
    const allocator = new Allocator(1024, 16, 16)
    const simpleComponentCollection = new ComponentCollection(allocator, simpleComponent, 10, 10) as unknown as ComponentCollection<ReturnType<SimpleComponent['registerSchema']>>

    const entityRef = 0
    const simpleComponentData = simpleComponentCollection.add(entityRef)
    simpleComponentData.a = 1
    simpleComponentData.b = 2
    const entityRef2 = 1
    const entityRef3 = 2
    let data = simpleComponentCollection.add(entityRef2)
    data.a = 3
    data.b = 4

    const entityRef2DataPtr = data.__index

    data = simpleComponentCollection.add(entityRef3)
    data.a = 5
    data.b = 6

    simpleComponentCollection.remove(entityRef2)

    data = simpleComponentCollection.get(entityRef)
    expect(data.a).toBe(1)
    expect(data.b).toBe(2)

    expect(() => simpleComponentCollection.get(entityRef2)).toThrow()

    data = simpleComponentCollection.get(entityRef3)
    expect(data.a).toBe(5)
    expect(data.b).toBe(6)

    const entityRef4 = 3

    data = simpleComponentCollection.add(entityRef4)

    expect(data.__index).toBe(entityRef2DataPtr)

    expect(data.a).toBe(3)
    expect(data.b).toBe(4)

    simpleComponentCollection.remove(entityRef4)

    expect(() => simpleComponentCollection.get(entityRef4)).toThrow()

    const entityRef5 = 4
    data = simpleComponentCollection.add(entityRef5, true)

    expect(data.__index).toBe(entityRef2DataPtr)
    expect(data.a).toBe(0)
    expect(data.b).toBe(0)

    data = simpleComponentCollection.get(entityRef)

    expect(data.a).toBe(1)
    expect(data.b).toBe(2)
  })

  test('Resize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const simpleComponentCollection = new ComponentCollection(allocator, simpleComponent, 10, 4) as unknown as ComponentCollection<ReturnType<SimpleComponent['registerSchema']>>

    for (let i = 0; i < 10; i++) {
      const data = simpleComponentCollection.add(i)
      data.a = i
      data.b = i
    }

    for (let i = 0; i < 10; i++) {
      const data = simpleComponentCollection.get(i)
      expect(data.a).toBe(i)
      expect(data.b).toBe(i)
    }
  })
})