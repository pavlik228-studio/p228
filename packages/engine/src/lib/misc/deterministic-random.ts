import { Allocator, DataType, Primitive } from '@p228/ecs'

export class DeterministicRandom {
  private readonly _state: Primitive
  constructor(
    private readonly _allocator: Allocator,
    private readonly _seed: number,
  ) {
    this._state = this._allocator.allocateStruct(Primitive, DataType.u32)
    this._state.value = this._seed
  }

  /**
   * Mulberry32 PRNG
   * @private
   */
  private nextState(): number {
    this._state.value += 0x6D2B79F5
    let t = this._state.value

    t = ((t ^ t >>> 15) * (t | 1)) | 0
    t ^= t + (((t ^ t >>> 7) * (t | 61)) | 0)

    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextState() * (max - min + 1) + min)
  }

  public nextFloat(min = 0, max = 1): number {
    return this.nextState() * (max - min) + min
  }
}