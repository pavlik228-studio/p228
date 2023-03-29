import { Allocator } from '@p228/ecs-legacy';

export class RefAccessor {
  public static readonly byteLength = 4;
  constructor(
    private readonly _byteOffset: number,
    private readonly _allocator: Allocator
  ) {}

  public get value(): number {
    return this._allocator.refsDataView.getUint32(this._byteOffset);
  }

  public set value(value: number) {
    this._allocator.refsDataView.setUint32(this._byteOffset, value);
  }
}
