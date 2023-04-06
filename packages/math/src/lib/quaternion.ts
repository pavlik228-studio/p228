import { MathOps } from './math-ops'
import { IVector3Like } from './vector3'

export interface IQuaternionLike {
  x: number
  y: number
  z: number
  w: number
}

export class Quaternion {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public w = 1
  ) {
  }

  public static MultiplyVector3(vector: IVector3Like, quaternion: IQuaternionLike, result: IVector3Like = vector): IVector3Like {
    const x = quaternion.x
    const y = quaternion.y
    const z = quaternion.z
    const w = quaternion.w

    const ix = w * vector.x + y * vector.z - z * vector.y
    const iy = w * vector.y + z * vector.x - x * vector.z
    const iz = w * vector.z + x * vector.y - y * vector.x
    const iw = -x * vector.x - y * vector.y - z * vector.z

    result.x = ix * w + iw * -x + iy * -z - iz * -y
    result.y = iy * w + iw * -y + iz * -x - ix * -z
    result.z = iz * w + iw * -z + ix * -y - iy * -x

    return result
  }

  public static Slerp(a: IQuaternionLike, b: IQuaternionLike, t: number, result: IQuaternionLike): IQuaternionLike {
    const ax = a.x
    const ay = a.y
    const az = a.z
    const aw = a.w
    let bx = b.x
    let by = b.y
    let bz = b.z
    let bw = b.w

    let omega
    let cosom
    let sinom
    let scale0
    let scale1

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw

    // adjust signs (if necessary)
    if (cosom < 0.0) {
      cosom = -cosom
      bx = -bx
      by = -by
      bz = -bz
      bw = -bw
    }

    if ((1.0 - cosom) > 0.000001) {
      // standard case (slerp)
      omega = MathOps.acos(cosom)
      sinom = MathOps.sin(omega)
      scale0 = MathOps.sin((1.0 - t) * omega) / sinom
      scale1 = MathOps.sin(t * omega) / sinom
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t
      scale1 = t
    }

    // calculate final values
    result.x = scale0 * ax + scale1 * bx
    result.y = scale0 * ay + scale1 * by
    result.z = scale0 * az + scale1 * bz
    result.w = scale0 * aw + scale1 * bw

    return result
  }

  public identity(): this {
    this.x = 0
    this.y = 0
    this.z = 0
    this.w = 1

    return this
  }

  public fromEuler(x: number, y: number, z: number): this {
    const halfToRad = 0.5 * MathOps.Deg2Rad
    x *= halfToRad
    y *= halfToRad
    z *= halfToRad

    const sx = MathOps.sin(x)
    const cx = MathOps.cos(x)
    const sy = MathOps.sin(y)
    const cy = MathOps.cos(y)
    const sz = MathOps.sin(z)
    const cz = MathOps.cos(z)

    this.x = sx * cy * cz - cx * sy * sz
    this.y = cx * sy * cz + sx * cy * sz
    this.z = cx * cy * sz - sx * sy * cz
    this.w = cx * cy * cz + sx * sy * sz

    return this
  }

  public fromAxisAngle(axis: IVector3Like, angle: number): this {
    const halfAngle = angle * 0.5
    const s = MathOps.sin(halfAngle)
    const c = MathOps.cos(halfAngle)

    this.x = axis.x * s
    this.y = axis.y * s
    this.z = axis.z * s
    this.w = c

    return this
  }

  public from(other: IQuaternionLike): this {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    this.w = other.w

    return this
  }

  public fromArray(array: ArrayLike<number>, offset = 0): this {
    this.x = array[offset]
    this.y = array[offset + 1]
    this.z = array[offset + 2]
    this.w = array[offset + 3]

    return this
  }

  public set(x: number, y: number, z: number, w: number): this {
    this.x = x
    this.y = y
    this.z = z
    this.w = w

    return this
  }

  public multiply(other: IQuaternionLike): this {
    const ax = this.x
    const ay = this.y
    const az = this.z
    const aw = this.w
    const bx = other.x
    const by = other.y
    const bz = other.z
    const bw = other.w

    this.x = ax * bw + aw * bx + ay * bz - az * by
    this.y = ay * bw + aw * by + az * bx - ax * bz
    this.z = az * bw + aw * bz + ax * by - ay * bx
    this.w = aw * bw - ax * bx - ay * by - az * bz

    return this
  }

  public normalize(): this {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w
    let len = x * x + y * y + z * z + w * w

    if (len > 0) {
      len = 1 / Math.sqrt(len)
      this.x = x * len
      this.y = y * len
      this.z = z * len
      this.w = w * len
    }

    return this
  }

  public invert(): this {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w
    let len = x * x + y * y + z * z + w * w

    if (len > 0) {
      len = 1 / len
      this.x = -x * len
      this.y = -y * len
      this.z = -z * len
      this.w = w * len
    }

    return this
  }

}