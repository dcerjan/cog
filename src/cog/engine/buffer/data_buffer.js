import Buffer from "./buffer";

class DataBuffer extends Buffer {
  constructor(type) {
    super(Buffer.Target.Array, type);
  }

  draw(primitive, offset, vertices) {
    gl.drawArray(primitive, offset, vertices);
  }
}


export default DataBuffer;