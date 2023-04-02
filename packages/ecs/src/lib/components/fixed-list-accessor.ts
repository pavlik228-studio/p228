import { TypedArray } from '../allocator/data-type'
import { IDataFieldAccessor } from './component.types'

export class FixedListAccessor implements IDataFieldAccessor<TypedArray> {
  constructor(
    private readonly _typedArray: TypedArray,
    private readonly _stepOffset: number,
  ) {
  }

  public get(index: number): TypedArray {
    return this._typedArray.subarray(index * this._stepOffset, (index + 1) * this._stepOffset)
  }

}