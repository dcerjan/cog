import Buffer from "./buffer";

class IndexBuffer extends Buffer {
  constructor() {
    super(Buffer.Target.ElementArray, Buffer.Type.Static.Draw, null);
  }

  data(data) {
    let arrData;
    if(data.every(v => v <= 256)) {
      arrData = new Uint8Array(data);
      this.drawDataType = Buffer.DataType.UnsignedByte;
    } else if (data.every(v => v <= 65536)) {
      arrData = new Uint16Array(data);
      this.drawDataType = Buffer.DataType.UnsignedShort;
    } else {
      arrData = new Uint32Array(data);
      this.drawDataType = Buffer.DataType.UnsignedInt;
    }
    super.data(arrData);
  }

  pointer() { throw new Exception("IndexBuffer.pointer not allowed to be called"); }

  draw(primitive, vertices, datatype, offset) {
    gl.drawElements(primitive, vertices, this.drawDataType, offset);
    gl.inc();
  }
}

export default IndexBuffer;