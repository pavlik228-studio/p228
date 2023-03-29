import { Allocator } from '@p228/ecs-legacy';
import { DataViewHelper } from '../../misc/data-view-helper';
import {
  IStructureData,
  IStructureDataType,
  IStructureSchema,
  IStructureValue,
} from '../../public-types';
import { DataType, DataTypeSize } from '../data-type';
import { HeapPrimitiveAccessor } from '../heap-primitive-accessor';
import { RefAccessor } from '../ref-accessor';
import { IAllocatorStructure } from './allocator-structure.interface';
import { ListLegacy } from './list-legacy';

export class StructList<T extends IStructureSchema>
  implements IAllocatorStructure
{
  private _heapView!: DataView;
  private readonly _keys: Array<keyof T>;
  private readonly _keysLength: number;
  private readonly _dataBuffer: IStructureData<T>;
  private readonly _structByteLength: number;
  private readonly _recycledList: ListLegacy;
  private readonly _ref: RefAccessor;

  constructor(
    private readonly _dataSchema: T,
    private readonly _maxSize: number,
    private readonly _allocator: Allocator,
    private _collectionSize = _maxSize / 10
  ) {
    this._collectionSize = Math.max(Math.ceil(_collectionSize / 8) * 8, 8);
    this._keys = this.getKeys();
    this._keysLength = this._keys.length;
    this._dataBuffer = this.createDataBuffer(_dataSchema);
    this._structByteLength = this.calculateByteLength(1);
    this._recycledList = this._allocator.allocateList(DataType.u32, _maxSize);
    this._byteLength = this._structByteLength * this._collectionSize;
    console.log(
      'StructList: byteLength',
      this._byteLength,
      'structByteLength',
      this._structByteLength,
      'collectionSize',
      this._collectionSize
    );
    this._byteOffset = this._allocator.allocate(
      this._byteLength + HeapPrimitiveAccessor.byteLength
    );
    this._length = new HeapPrimitiveAccessor(DataType.u32);
    this._length.allocate(
      this._byteOffset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    this._heapView = new DataView(
      this._allocator.heap,
      this._byteOffset + HeapPrimitiveAccessor.byteLength,
      this._byteLength
    );
  }

  private _length: HeapPrimitiveAccessor;

  public get length(): number {
    return this._length.value;
  }

  private _byteOffset: number;

  public get byteOffset(): number {
    return this._byteOffset;
  }

  private _byteLength: number;

  public get byteLength(): number {
    return this._byteLength;
  }

  public get ref(): RefAccessor {
    return this._ref;
  }

  public add(data: IStructureData<T>): number {
    const length = this._length.value;
    let index = this._recycledList.shift();
    if (index === undefined) index = length;
    if (index >= this._maxSize) throw new Error('StructList: Max size reached');
    if (index >= this._collectionSize)
      this.reallocate(this._collectionSize * 2);
    this.set(index, data);

    this._length.value = length + 1;

    return index;
  }

  public set(index: number, data: IStructureData<T>): void {
    const byteOffset = this._structByteLength * index;
    let structOffset = 0;

    for (let i = 0; i < this._keysLength; i++) {
      const key = this._keys[i];
      const value = data[key];
      console.log(
        key,
        value,
        byteOffset + structOffset,
        this._heapView.byteOffset,
        this._heapView.byteLength
      );
      structOffset += this.setStructData(
        this._dataSchema[key],
        value,
        byteOffset + structOffset
      );
    }
  }

  public get(index: number): IStructureData<T> {
    const byteOffset = this._structByteLength * index;
    const data: IStructureData<T> = {} as any;
    let structOffset = 0;

    for (let i = 0; i < this._keysLength; i++) {
      const key = this._keys[i];
      const value = this.getStructData(
        this._dataSchema[key],
        key,
        byteOffset + structOffset
      );
      structOffset += this.calculateDataTypeByteLength(this._dataSchema[key]);
      data[key] = value as never;
    }

    return data;
  }

  public remove(index: number): void {
    this._recycledList.add(index);
    this._length.value--;
  }

  public transfer(byteOffset: number, heap: ArrayBuffer): void {
    this._byteOffset = byteOffset;
    this._heapView = new DataView(
      heap,
      this._byteOffset + HeapPrimitiveAccessor.byteLength,
      this._byteLength
    );
    this._length.transfer(this._byteOffset, heap);
  }

  private reallocate(newSize: number): void {
    const newByteLength = this.calculateByteLength(newSize);
    const newByteOffset = this._allocator.allocate(newByteLength);
    const newHeapView = new DataView(
      this._allocator.heap,
      newByteOffset + HeapPrimitiveAccessor.byteLength,
      newByteLength
    );
    const length = this._length.value;

    this._length.free();

    new Uint8Array(
      newHeapView.buffer,
      newHeapView.byteOffset,
      newHeapView.byteLength
    ).set(
      new Uint8Array(
        this._heapView.buffer,
        this._heapView.byteOffset,
        this._heapView.byteLength
      )
    );

    this._allocator.free(this._byteOffset);
    this._byteOffset = newByteOffset;
    this._byteLength = newByteLength;
    this._heapView = newHeapView;
    this._length.allocate(
      this._byteOffset,
      HeapPrimitiveAccessor.byteLength,
      this._allocator.heap
    );
    this._length.value = length;
  }

  private getKeys(): Array<string> {
    return Object.keys(this._dataSchema).sort();
  }

  private setStructData<T>(
    sDataType: IStructureDataType,
    value: IStructureValue,
    byteOffset: number
  ): number {
    let byteOffsetDiff = 0;
    if (Array.isArray(sDataType)) {
      const [type, size] = sDataType;
      for (let i = 0; i < size; i++) {
        byteOffsetDiff += DataViewHelper.structDataSetter(
          this._heapView,
          type,
          (value as Array<number>)[i],
          byteOffset + byteOffsetDiff
        );
      }
    } else {
      byteOffsetDiff += DataViewHelper.structDataSetter(
        this._heapView,
        sDataType as DataType,
        value as number,
        byteOffset
      );
    }

    return byteOffsetDiff;
  }

  private createDataBuffer(schema: T): IStructureData<T> {
    const buffer: IStructureData<T> = {} as IStructureData<T>;
    for (const key in schema) {
      const dataType = schema[key];
      if (Array.isArray(dataType)) {
        const [, size] = dataType;
        buffer[key] = new Array(size).fill(0) as never;
      } else {
        buffer[key] = 0 as never;
      }
    }
    return buffer;
  }

  private calculateDataTypeByteLength(
    structDataType: IStructureDataType
  ): number {
    if (Array.isArray(structDataType)) {
      const [type, size] = structDataType;
      return size * DataTypeSize[type];
    } else {
      return DataTypeSize[structDataType as DataType];
    }
  }

  private calculateByteLength(size: number): number {
    let byteLength = 0;
    for (const key of this._keys) {
      const dataType = this._dataSchema[key];
      byteLength += this.calculateDataTypeByteLength(dataType);
    }
    return byteLength * size;
  }

  private getStructData(
    dataSchemaElement: T[keyof T],
    key: keyof T,
    value: number
  ): IStructureValue {
    if (!Array.isArray(dataSchemaElement)) {
      return DataViewHelper.structDataGetter(
        this._heapView,
        dataSchemaElement as DataType,
        value
      );
    }

    let byteOffsetDiff = 0;
    const [type, size] = dataSchemaElement;
    const array = this._dataBuffer[key] as Array<number>;

    for (let i = 0; i < size; i++) {
      array[i] = DataViewHelper.structDataGetter(
        this._heapView,
        type,
        value + byteOffsetDiff
      );
      byteOffsetDiff += DataTypeSize[type];
    }

    return array;
  }
}
