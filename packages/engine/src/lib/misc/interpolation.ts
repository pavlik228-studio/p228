import { EntityRef } from '@p228/ecs'
import { Transform2d } from '@p228/engine'
import { MathOps } from '@p228/math'

const TRANSFORM_LIKE_BUFFER = { x: 0, y: 0, rotation: 0 }

export class Interpolation {
  public static interpolateTransform2d(entityRef: EntityRef, transform2d: typeof Transform2d, interpolationFactor: number): typeof TRANSFORM_LIKE_BUFFER {
    TRANSFORM_LIKE_BUFFER.x = MathOps.lerp(transform2d.prevX[entityRef], transform2d.x[entityRef], interpolationFactor)
    TRANSFORM_LIKE_BUFFER.y = -MathOps.lerp(transform2d.prevY[entityRef], transform2d.y[entityRef], interpolationFactor)
    TRANSFORM_LIKE_BUFFER.rotation = MathOps.lerpAngle(transform2d.prevRotation[entityRef], transform2d.rotation[entityRef], interpolationFactor)
    return TRANSFORM_LIKE_BUFFER
  }
}