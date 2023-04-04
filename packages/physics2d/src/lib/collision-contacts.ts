class Pool<T> {
  private readonly _items: Array<T>

  constructor(private readonly factory: () => T, initialSize: number) {
    this._items = new Array<T>(initialSize)
    for (let i = 0; i < initialSize; i++) {
      this._items[i] = factory()
    }
  }

  public get(): T {
    return this._items.pop() ?? this.factory()
  }

  public release(item: T) {
    this._items.push(item)
  }
}

const SINGLE_CONTACT_RESULT_BUFFER = { handle: 0, otherHandle: 0 }
const MULTI_CONTACT_RESULT_BUFFER = new Array<number>()

export class CollisionContacts {
  private readonly _collisionContacts = new Array<[ number, number ]>()
  private readonly _collisionContactsPool = new Pool<[ number, number ]>(() => [ 0, 0 ], 32)

  public register(colliderHandle1: number, colliderHandle2: number) {
    const contact = this._collisionContactsPool.get()
    contact[0] = colliderHandle1
    contact[1] = colliderHandle2
    this._collisionContacts.push(contact)
  }

  public clear() {
    for (const contact of this._collisionContacts) {
      this._collisionContactsPool.release(contact)
    }
    this._collisionContacts.length = 0
  }

  public hasContact(colliderHandle1: number, colliderHandle2: number) {
    for (const contact of this._collisionContacts) {
      if (contact[0] === colliderHandle1 && contact[1] === colliderHandle2) {
        return true
      }
      if (contact[0] === colliderHandle2 && contact[1] === colliderHandle1) {
        return true
      }
    }
    return false
  }

  public hasAnyContact(colliderHandle: number) {
    for (const contact of this._collisionContacts) {
      if (contact[0] === colliderHandle || contact[1] === colliderHandle) {
        return true
      }
    }
    return false
  }

  public findOne(colliderHandler: number): typeof SINGLE_CONTACT_RESULT_BUFFER | undefined {
    for (const contact of this._collisionContacts) {
      if (contact[0] === colliderHandler) {
        SINGLE_CONTACT_RESULT_BUFFER.handle = contact[0]
        SINGLE_CONTACT_RESULT_BUFFER.otherHandle = contact[1]
        return SINGLE_CONTACT_RESULT_BUFFER
      }
      if (contact[1] === colliderHandler) {
        SINGLE_CONTACT_RESULT_BUFFER.handle = contact[1]
        SINGLE_CONTACT_RESULT_BUFFER.otherHandle = contact[0]
        return SINGLE_CONTACT_RESULT_BUFFER
      }
    }
    return undefined
  }

  public findAll(colliderHandler: number): typeof MULTI_CONTACT_RESULT_BUFFER {
    MULTI_CONTACT_RESULT_BUFFER.length = 0
    for (const contact of this._collisionContacts) {
      if (contact[0] === colliderHandler) {
        MULTI_CONTACT_RESULT_BUFFER.push(contact[1])
      }
      if (contact[1] === colliderHandler) {
        MULTI_CONTACT_RESULT_BUFFER.push(contact[0])
      }
    }
    return MULTI_CONTACT_RESULT_BUFFER
  }
}