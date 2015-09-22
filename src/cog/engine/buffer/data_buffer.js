import Buffer from "./buffer";

class DataBuffer extends Buffer {
  constructor(type) {
    super(Buffer.Target.Array, type);
  }
}

export default DataBuffer;