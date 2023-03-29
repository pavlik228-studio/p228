import { Allocator } from './allocator'

export type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never
export interface IStructConstructor<T extends IAllocatorStructure> {
  new(allocator: Allocator, ...args: any[]): T
}
export interface ILazyStructConstructor<T extends ILazyAllocatorStructure> {
  new(allocator: Allocator, ...args: any[]): T
}
export interface IPtrAccessor {
  readonly _id: number
  value: number
}

/**
 * Allocator structures are structures that are allocated when created.
 */
export interface IAllocatorStructure {
  readonly ptr: IPtrAccessor
  readonly byteLength: number
  transfer(heap: ArrayBuffer): void
}

/**
 * Lazy structures are structures that are not allocated when created.
 */
export interface ILazyAllocatorStructure extends IAllocatorStructure {
  allocate(heap: ArrayBuffer, offset: number): void
}