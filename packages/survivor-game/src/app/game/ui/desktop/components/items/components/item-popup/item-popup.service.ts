import { Disposable, TypedEvent } from '@p228/engine'

export enum ItemPopupKind {
  Buy,
  Sell,
  UnlockSlot
}

export enum ItemType {
  Weapon,
  Item,
}

export interface ItemPopupData {
  kind: ItemPopupKind
  type: ItemType
  itemId?: string
}

export class ItemPopupService {
  private static _event = new TypedEvent<ItemPopupData | undefined>()
  public static show(kind: ItemPopupKind, type: ItemType, itemId?: string): void {
    console.log(`ItemPopupService.show: kind=${kind}, type=${type}, itemId=${itemId}`)
    this._event.emit({ kind, type, itemId })
  }

  public static subscribe(callback: (data: ItemPopupData | undefined) => void): Disposable {
    return this._event.on(callback)
  }

  public static hide() {
    this._event.emit(undefined)
  }
}