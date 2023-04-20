export class PRNG {
  constructor(
    private _state: number
  ) {
  }

  public resetState(newState: number): void {
    this._state = newState
  }

  public nextFloat(): number {
    this._state += 0x6D2B79F5
    let t = this._state

    t = ((t ^ t >>> 15) * (t | 1)) | 0
    t ^= t + (((t ^ t >>> 7) * (t | 61)) | 0)

    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  public shuffle<T>(array: Array<T>): Array<T> {
    let currentIndex = array.length
    let temporaryValue: T
    let randomIndex: number

    while (currentIndex !== 0) {
      randomIndex = Math.floor(this.nextFloat() * currentIndex)
      currentIndex -= 1

      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  }
}