import { describe, expect } from 'vitest'
import { Allocator } from '../allocator'
import { List } from './list'

describe('List', () => {
  test('Add', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)

    list.add(14)
    list.add(15)
    list.add(16)
    list.add(17)

    expect(list.length).toBe(4)

    expect(list.get(0)).toBe(14)
    expect(list.get(1)).toBe(15)
    expect(list.get(2)).toBe(16)
    expect(list.get(3)).toBe(17)
  })

  test('Remove', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)

    list.add(14)
    list.add(15)
    list.add(16)
    list.add(17)

    expect(list.length).toBe(4)

    list.remove(1)

    expect(list.length).toBe(3)
    expect(list.get(0)).toBe(14)
    expect(list.get(1)).toBe(17)
    expect(list.get(2)).toBe(16)
    expect(list.get(3)).toBe(undefined)

    list.remove(list.length - 1)

    expect(list.length).toBe(2)
    expect(list.get(0)).toBe(14)
    expect(list.get(1)).toBe(17)
    expect(list.get(2)).toBe(undefined)

    list.remove(0)

    expect(list.length).toBe(1)
    expect(list.get(0)).toBe(17)
  })

  test('Resize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list1 = allocator.allocateStruct(List, 10)
    const list = allocator.allocateStruct(List, 4)
    const list2 = allocator.allocateStruct(List, 10)

    list.add(2000)
    list.add(3000)
    list.add(5000)
    list.add(6000)

    for (let i = 0; i < 11; i++) {
      list1.add(88)
      list2.add(88)
    }

    expect(list.length).toBe(4)
    expect(list.size).toBe(4)

    list.add(7000)

    for (let i = 0; i < 40; i++) {
      list1.add(88)
      list2.add(88)
    }

    expect(list.length).toBe(5)
    expect(list.size).toBe(8)

    expect(list.get(0)).toBe(2000)
    expect(list.get(1)).toBe(3000)
    expect(list.get(2)).toBe(5000)
    expect(list.get(3)).toBe(6000)

  })

  test('OnResize', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)
    const oldHeap = allocator.heap

    list.add(2000)
    list.add(3000)
    list.add(5000)
    list.add(6000)
    const ptr1 = list.ptr.value
    list.add(8000)
    const ptr2 = list.ptr.value

    expect(list.length).toBe(5)
    expect(list.size).toBe(8)

    allocator['resize'](allocator.heap.byteLength * 2)

    const ptr3 = list.ptr.value

    console.log(ptr1, ptr2, ptr3)

    expect(allocator.heap).not.toBe(oldHeap)
    expect(list.length).toBe(5)
    expect(list.size).toBe(8)
    expect(list.get(0)).toBe(2000)
    expect(list.get(1)).toBe(3000)
    expect(list.get(2)).toBe(5000)
    expect(list.get(3)).toBe(6000)
  })

  test('Iterator', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)

    list.add(2000)
    list.add(3000)
    list.add(5000)
    list.add(6000)

    const arr = [...list]

    expect(arr.length).toBe(4)
    expect(arr[0]).toBe(2000)
    expect(arr[1]).toBe(3000)
    expect(arr[2]).toBe(5000)
    expect(arr[3]).toBe(6000)
  })

  test('Snapshot', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)

    list.add(2000)
    list.add(3000)
    list.add(5000)
    list.add(6000)
    list.add(6000)

    const snapshot = allocator.createSnapshot()

    const allocator2 = new Allocator(1024, 16, 16)
    const list2 = allocator2.allocateStruct(List, 4)
    allocator2.applySnapshot(snapshot)

    expect(list2.length).toBe(5)
    expect(list2.size).toBe(8)
    expect(list2.get(0)).toBe(2000)
    expect(list2.get(1)).toBe(3000)
    expect(list2.get(2)).toBe(5000)
    expect(list2.get(3)).toBe(6000)
    expect(list2.get(4)).toBe(6000)
  })

  test('Pop/Shift', () => {
    const allocator = new Allocator(1024, 16, 16)
    const list = allocator.allocateStruct(List, 4)

    list.add(2000)
    list.add(3000)
    list.add(5000)
    list.add(6000)
    list.add(6000)

    expect(list.pop()).toBe(6000)
    expect(list.shift()).toBe(2000)
    expect(list.length).toBe(3)
  })
})