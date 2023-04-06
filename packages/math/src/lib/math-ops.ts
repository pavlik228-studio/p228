import cos from '@stdlib/math-base-special-cos'
import sin from '@stdlib/math-base-special-sin'
import atan2 from '@stdlib/math-base-special-atan2'
import acos from '@stdlib/math-base-special-acos'

export class MathOps {
  public static PI = 3.141592653589793
  public static PI_2 = 6.283185307179586
  public static PI_HALF = 1.5707963267948966
  public static PI_3_4 = 4.71238898038469
  public static Deg2Rad = 3.141592653589793 / 180

  public static cos(angle: number): number {
    return cos(angle)
  }

  public static sin(angle: number): number {
    return sin(angle)
  }

  public static atan2(y: number, x: number): number {
    return atan2(y, x)
  }

  public static acos(value: number): number {
    return acos(value)
  }

  public static clamp01(value: number): number {
    return Math.max(0, Math.min(1, value))
  }

  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  }

  public static repeat(t: number, length: number): number {
    return t - Math.floor(t / length) * length
  }

  public static lerpAngle(a: number, b: number, t: number): number {
    let num = MathOps.repeat(b - a, MathOps.PI_2)
    if (num > MathOps.PI) {
      num -= MathOps.PI_2
    }
    return a + num * t
  }
}

