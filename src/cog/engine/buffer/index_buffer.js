import Buffer from "./buffer";

class IndexBuffer extends Buffer {
  constructor() {
    super(Buffer.Target.ElementArray, Buffer.Type.Static.Draw);
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
}

export default IndexBuffer;