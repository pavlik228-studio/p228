import { Disposable, TypedEvent } from '@p228/engine'
import { IViewItem } from '../../item.interface'

export enum ItemPopupKind {
  Buy,
  Sell,
  UnlockSlot
}

export interface ItemPopupData {
  kind: ItemPopupKind
  item: IViewItem | undefined
}

export class ItemPopupService {
  private static _event = new TypedEvent<ItemPopupData | undefined>()
  public static show(kind: ItemPopupKind, item?: IViewItem): void {
    console.log(`ItemPopupService.show: kind=${kind}`, item)
    this._event.emit({ kind, item })
  }

  public static subscribe(callback: (data: ItemPopupData | undefined) => void): Disposable {
    return this._event.on(callback)
  }

  public static hide() {
    this._event.emit(undefined)
  }
}