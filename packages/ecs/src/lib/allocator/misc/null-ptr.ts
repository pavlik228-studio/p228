import { IPtrAccessor } from '../allocator.types'

export class NullPtr implements IPtrAccessor {
  public readonly _id = -1
  public value = -1

}