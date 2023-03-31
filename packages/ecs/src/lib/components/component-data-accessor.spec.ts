import { describe, expect } from 'vitest'
import { DataType } from '../allocator/data-type'
import { ComponentSchema } from './component-schema'
import { createComponentDataAccessor } from './component-data-acessor'
import { IFixedList } from './component.types'

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

class TestComponentFixedList extends ComponentSchema {
  public registerSchema() {
    return {
      a: DataType.u8,
      lol: DataType.u8,
      fixedList: [ DataType.u8, 4 ] as IFixedList,
      x: DataType.u16,
    }
  }
}

const testComponent = new TestComponent(1)
const testComponentFixedList = new TestComponentFixedList(2)

describe('ComponentDataAccessor', () => {
  test('Basic', () => {
    const buffer = new ArrayBuffer(64)
    const dataView = new DataView(buffer, 0, 64)
    const accessor = createComponentDataAccessor(testComponent, dataView)

    accessor.__index = 0

    accessor.a = 1
    accessor.lol = 2
    accessor.kek = 3
    accessor.cheburek = 4

    expect(accessor.a).toBe(1)
    expect(accessor.lol).toBe(2)
    expect(accessor.kek).toBe(3)
    expect(accessor.cheburek).toBe(4)

    accessor.__index = 1

    expect(accessor.a).toBe(0)
    expect(accessor.lol).toBe(0)
    expect(accessor.kek).toBe(0)
    expect(accessor.cheburek).toBe(0)

    accessor.a = 5

    expect(accessor.a).toBe(5)

    accessor.__index = 0

    expect(accessor.a).toBe(1)
  })

  test('Fixed list', () => {
    const buffer = new ArrayBuffer(64)
    const dataView = new DataView(buffer, 0, 64)
    const accessor = createComponentDataAccessor(testComponentFixedList, dataView)

    accessor.__index = 0

    accessor.a = 1
    accessor.lol = 2
    accessor.fixedList[0] = 3
    accessor.fixedList[1] = 4
    accessor.fixedList[2] = 5
    accessor.fixedList[3] = 6
    accessor.x = 7

    expect(accessor.a).toBe(1)
    expect(accessor.lol).toBe(2)
    expect(accessor.fixedList[0]).toBe(3)
    expect(accessor.fixedList[1]).toBe(4)
    expect(accessor.fixedList[2]).toBe(5)
    expect(accessor.fixedList[3]).toBe(6)
    expect(accessor.x).toBe(7)

    accessor.__index = 1

    expect(accessor.a).toBe(0)
    expect(accessor.lol).toBe(0)
    expect(accessor.fixedList[0]).toBe(0)
    expect(accessor.fixedList[1]).toBe(0)
    expect(accessor.fixedList[2]).toBe(0)
    expect(accessor.fixedList[3]).toBe(0)
    expect(accessor.x).toBe(0)
    
    const accessor2 = createComponentDataAccessor(testComponentFixedList, dataView)
    accessor2.__index = 0
    expect(accessor2.a).toBe(1)
    expect(accessor2.lol).toBe(2)
    expect(accessor2.fixedList[0]).toBe(3)
    expect(accessor2.fixedList[1]).toBe(4)
    expect(accessor2.fixedList[2]).toBe(5)
    expect(accessor2.fixedList[3]).toBe(6)
    expect(accessor2.x).toBe(7)

  })
})