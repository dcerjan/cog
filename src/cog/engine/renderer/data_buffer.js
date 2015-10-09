import Buffer from "./buffer";
import gl from "./gl";

class DataBuffer extends Buffer {
  constructor(type) {
    super(Buffer.Target.Array, type);
  }

  draw(primitive, offset, vertices) {
    gl.drawArray(primitive, offset, vertices);
    gl.inc();
  }
}


export default DataBuffer;