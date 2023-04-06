export interface IVector3Like {
  x: number
  y: number
  z: number
}

export class Vector3 {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0
  ) {
  }

  public static DistanceSquared(left: IVector3Like, right: IVector3Like): number {
    const dx = left.x - right.x
    const dy = left.y - right.y
    const dz = left.z - right.z

    return dx * dx + dy * dy + dz * dz
  }

  public static Distance(left: IVector3Like, right: IVector3Like): number {
    return Math.sqrt(Vector3.DistanceSquared(left, right))
  }

  public static Normalize(vector: IVector3Like): IVector3Like {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
    vector.x /= length
    vector.y /= length
    vector.z /= length

    return vector
  }

  public static Dot(left: IVector3Like, right: IVector3Like): number {
    return left.x * right.x + left.y * right.y + left.z * right.z
  }

  public static Cross(left: IVector3Like, right: IVector3Like): IVector3Like {
    const x = left.y * right.z - left.z * right.y
    const y = left.z * right.x - left.x * right.z
    const z = left.x * right.y - left.y * right.x

    return { x, y, z }
  }

  public static Lerp(left: IVector3Like, right: IVector3Like, amount: number, result: IVector3Like): IVector3Like {
    result.x = left.x + (right.x - left.x) * amount
    result.y = left.y + (right.y - left.y) * amount
    result.z = left.z + (right.z - left.z) * amount

    return result
  }

  public set(x: number, y: number, z: number): this {
    this.x = x
    this.y = y
    this.z = z

    return this
  }

  public from(other: IVector3Like): this {
    this.x = other.x
    this.y = other.y
    this.z = other.z

    return this
  }

  public fromArray(array: ArrayLike<number>, offset = 0): this {
    this.x = array[offset]
    this.y = array[offset + 1]
    this.z = array[offset + 2]

    return this
  }

  public add(other: IVector3Like): this {
    this.x += other.x
    this.y += other.y
    this.z += other.z

    return this
  }

  public sub(other: IVector3Like): this {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z

    return this
  }

  public scale(scalar: number): this {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar

    return this
  }

  public normalize(): this {
    Vector3.Normalize(this)

    return this
  }
}