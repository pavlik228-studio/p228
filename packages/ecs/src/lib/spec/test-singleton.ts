import { DataType } from '../allocator/data-type'
import { defineSingletonComponent } from '../components/define-singleton'

export const TestSingleton = defineSingletonComponent({
  level: DataType.u8,
  bullets: [ DataType.u32, 10 ],
}, (raw) => {
  return {
    get level() {
      return raw.level[0]
    },
    set level(value) {
      raw.level[0] = value
    },
    get bullets() {
      return raw.bullets
    },
    set bullets(_) {
      throw new Error('Cannot set fixed list, use array accessors instead.')
    }
  }
})