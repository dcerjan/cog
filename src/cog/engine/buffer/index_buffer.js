import Buffer from "./buffer";

class IndexBuffer extends Buffer {
  constructor() {
    super(Buffer.Target.ElementArray, Buffer.Type.Static.Draw, null);
  }

  data(data) {
    let arrData;
    if(data.length <= Math.pow(2, 8)) {
      arrData = new Uint8Array(data);
    } else if (data.length <= Math.pow(2, 16)){
      arrData = new Uint16Array(data);
    } else {
      arrData = new Uint32Array(data);
    }
    super.data(arrData);
  }

  pointer() { throw new Exception("IndexBuffer.pointer not allowed to be called"); }

  draw(primitive, vertices, datatype, offset) {
    gl.drawElements(primitive, vertices, datatype, offset);
  }
}

export default IndexBuffer;