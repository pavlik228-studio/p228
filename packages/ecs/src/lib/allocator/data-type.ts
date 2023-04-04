export enum DataType {
  i8,
  i16,
  i32,
  i64,
  u8,
  u16,
  u32,
  u64,
  f32,
  f64,
}

export type TypedArray =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array;
export type TypedArrayConstructor =
  | typeof Int8Array
  | typeof Int16Array
  | typeof Int32Array
  | typeof Uint8Array
  | typeof Uint16Array
  | typeof Uint32Array
  | typeof Float32Array
  | typeof Float64Array;

export const DataTypeViewConstructor: {
  [key in DataType]: TypedArrayConstructor;
} = {
  [DataType.i8]: Int8Array,
  [DataType.i16]: Int16Array,
  [DataType.i32]: Int32Array,
  [DataType.i64]: Int32Array,
  [DataType.u8]: Uint8Array,
  [DataType.u16]: Uint16Array,
  [DataType.u32]: Uint32Array,
  [DataType.u64]: Uint32Array,
  [DataType.f32]: Float32Array,
  [DataType.f64]: Float64Array,
};

export const DataTypeSize: { [key in DataType]: number } = {
  [DataType.i8]: 1,
  [DataType.i16]: 2,
  [DataType.i32]: 4,
  [DataType.i64]: 8,
  [DataType.u8]: 1,
  [DataType.u16]: 2,
  [DataType.u32]: 4,
  [DataType.u64]: 8,
  [DataType.f32]: 4,
  [DataType.f64]: 8,
};

const buffer = new ArrayBuffer(8);

export const DataTypeBuffers: { [key in DataType]: TypedArray } = {
  [DataType.i8]: new Int8Array(buffer),
  [DataType.i16]: new Int16Array(buffer),
  [DataType.i32]: new Int32Array(buffer),
  [DataType.i64]: new Int32Array(buffer),
  [DataType.u8]: new Uint8Array(buffer),
  [DataType.u16]: new Uint16Array(buffer),
  [DataType.u32]: new Uint32Array(buffer),
  [DataType.u64]: new Uint32Array(buffer),
  [DataType.f32]: new Float32Array(buffer),
  [DataType.f64]: new Float64Array(buffer),
};

export const getRealNumber = (value: number, type: DataType) => {
  DataTypeBuffers[type][0] = value;
  return DataTypeBuffers[type][0];
};