import { DataType, defineSingletonComponent } from '@p228/ecs'

export const SingletonComponent = defineSingletonComponent({
  x: DataType.f32,
  y: DataType.u32,
}, (raw) => {
  return {
    get x() {
      return raw.x[0]
    },
    set x(value) {
      raw.x[0] = value
    },
    get y() {
      return raw.y[0]
    },
    set y(value) {
      raw.y[0] = value
    }
  }
})