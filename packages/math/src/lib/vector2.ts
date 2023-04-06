import { MathOps } from './math-ops'

export interface IVector2Like {
  x: number
  y: number
}

export class Vector2 implements IVector2Like {
  public static readonly Forward = Object.freeze(new Vector2(1, 0))
  public static readonly Right = Object.freeze(new Vector2(0, -1))

  constructor(public x = 0, public y = 0) {
  }

  public static Angle(left: IVector2Like, right: IVector2Like): number {
    return MathOps.atan2(right.y - left.y, right.x - left.x)
  }

  public static DistanceSquared(left: IVector2Like, right: IVector2Like): number {
    const dx = left.x - right.x
    const dy = left.y - right.y

    return dx * dx + dy * dy
  }

  public static Normalize(vector: IVector2Like): IVector2Like {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    vector.x /= length
    vector.y /= length

    return vector
  }

  public static Lerp(left: IVector2Like, right: IVector2Like, amount: number, res: IVector2Like): IVector2Like {
    const x = left.x + (right.x - left.x) * amount
    const y = left.y + (right.y - left.y) * amount

    res.x = x
    res.y = y

    return res
  }

  public set(x: number, y: number): this {
    this.x = x
    this.y = y

    return this
  }

  public from(other: IVector2Like): this {
    this.x = other.x
    this.y = other.y

    return this
  }

  public add(other: IVector2Like): this {
    this.x += other.x
    this.y += other.y

    return this
  }

  public sub(other: IVector2Like): this {
    this.x -= other.x
    this.y -= other.y

    return this
  }

  public scale(scalar: number): this {
    this.x *= scalar
    this.y *= scalar

    return this
  }

  public rotate(angle: number): this {
    const x = this.x
    const y = this.y
    const sinA = MathOps.sin(angle)
    const cosA = MathOps.cos(angle)

    this.x = x * cosA - y * sinA
    this.y = x * sinA + y * cosA

    return this
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared())
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  public normalize(): this {
    const length = this.length()

    if (length === 0) return this

    this.x /= length
    this.y /= length

    return this
  }

  public dot(other: IVector2Like): number {
    return this.x * other.x + this.y * other.y
  }
}
