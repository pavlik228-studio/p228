import { DataType, DataTypeSize } from '../allocator/data-type';

export class DataViewHelper {
  public static structDataSetter(
    dataView: DataView,
    dataType: DataType,
    value: number,
    byteOffset: number
  ): number {
    let byteDiff = DataTypeSize[dataType];
    switch (dataType) {
      case DataType.u8:
        dataView.setUint8(byteOffset, value);
        break;
      case DataType.u16:
        dataView.setUint16(byteOffset, value);
        break;
      case DataType.u32:
        dataView.setUint32(byteOffset, value);
        break;
      case DataType.u64:
        dataView.setBigUint64(byteOffset, BigInt(value));
        break;
      case DataType.i8:
        dataView.setInt8(byteOffset, value);
        break;
      case DataType.i16:
        dataView.setInt16(byteOffset, value);
        break;
      case DataType.i32:
        dataView.setInt32(byteOffset, value);
        break;
      case DataType.i64:
        dataView.setBigInt64(byteOffset, BigInt(value));
        break;
      case DataType.f32:
        dataView.setFloat32(byteOffset, value);
        break;
      case DataType.f64:
        dataView.setFloat64(byteOffset, value);
        break;
    }
    return byteDiff;
  }

  public static structDataGetter(
    dataView: DataView,
    dataType: DataType,
    byteOffset: number
  ): number {
    switch (dataType) {
      case DataType.u8:
        return dataView.getUint8(byteOffset);
      case DataType.u16:
        return dataView.getUint16(byteOffset);
      case DataType.u32:
        return dataView.getUint32(byteOffset);
      case DataType.u64:
        return Number(dataView.getBigUint64(byteOffset));
      case DataType.i8:
        return dataView.getInt8(byteOffset);
      case DataType.i16:
        return dataView.getInt16(byteOffset);
      case DataType.i32:
        return dataView.getInt32(byteOffset);
      case DataType.i64:
        return Number(dataView.getBigInt64(byteOffset));
      case DataType.f32:
        return dataView.getFloat32(byteOffset);
      case DataType.f64:
        return dataView.getFloat64(byteOffset);
    }
  }
}
