import { RefAccessor } from '../ref-accessor';

export interface IAllocatorStructure {
  readonly ref: RefAccessor;
  readonly byteLength: number;
  transfer(heap: ArrayBuffer): void;
}
