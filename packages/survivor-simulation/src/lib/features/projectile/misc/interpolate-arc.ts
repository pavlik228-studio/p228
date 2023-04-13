import { IVector2Like, MathOps, Vector2 } from '@p228/math'

const AMPLITUDE_BUFFER = new Vector2()
const MIDDLE_POINT_BUFFER = new Vector2()
const CONTROL_POINT_1_BUFFER = new Vector2()
const RESULT_BUFFER = new Vector2()

export function bezierInterpolate(
  startPos: IVector2Like,
  endPos: IVector2Like,
  amplitude: number,
  progress: number,
): Vector2 {
  // Calculate the middle point of the curve using the amplitude parameter, find center and add amplitude

  AMPLITUDE_BUFFER.set(
    startPos.x - endPos.x,
    startPos.y - endPos.y,
  ).normalize().rotate(MathOps.PI / 2).scale(amplitude)

  const middlePos = MIDDLE_POINT_BUFFER.set(
    (startPos.x + endPos.x) / 2,
    (startPos.y + endPos.y) / 2,
  ).add(AMPLITUDE_BUFFER)

  // Calculate the two control points for the quadratic Bezier curve
  const control1 = CONTROL_POINT_1_BUFFER.set(
    startPos.x + (middlePos.x - startPos.x) * 2 / 3,
    startPos.y + (middlePos.y - startPos.y) * 2 / 3,
  )

  // Calculate the interpolated position on the curve using the progress parameter
  const t: number = progress
  const u: number = 1 - t

  return RESULT_BUFFER.set(
    u * u * startPos.x + 2 * u * t * control1.x + t * t * endPos.x,
    u * u * startPos.y + 2 * u * t * control1.y + t * t * endPos.y,
  )
}
