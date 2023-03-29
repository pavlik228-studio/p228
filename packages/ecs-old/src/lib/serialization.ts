export const serialize = (data: ArrayBuffer): Array<number> => {
  const u8 = new Uint8Array(data);
  const result = [];

  for (let i = 0; i < u8.length; i++) {
    result[i] = u8[i];
  }

  return result;
};

export const deserialize = (data: Array<number>): ArrayBuffer => {
  const arrayBuffer = new ArrayBuffer(data.length);
  const u8 = new Uint8Array(arrayBuffer);

  for (let i = 0; i < data.length; i++) {
    u8[i] = data[i];
  }

  return arrayBuffer;
};
