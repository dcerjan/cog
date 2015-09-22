import Buffer from "../buffer/buffer";
import DataBuffer from "../buffer/data_buffer";
import IndexBuffer from "../buffer/index_buffer";

class Surface {

  constructor(xpos, ypos, width, height) {
    this.rect = {x: xpos || -1.0, y: ypos || -1.0, w: width || 2.0, h: height || 2.0};
    this.data = new DataBuffer(Buffer.Type.Static.Draw);
    this.indices = new IndexBuffer();

    this.data.data(new Float32Array([
      this.rect.x,                this.rect.y,
      this.rect.x,                this.rect.y + this.rect.h,
      this.rect.x + this.rect.w,  this.rect.y,
      this.rect.x + this.rect.w,  this.rect.y + this.rect.h
    ]));
    this.data.pointer(0, 2, Buffer.DataType.Float, 0, 0);
    this.indices.data([0, 1, 2, 3]);
  }

  blit() {
    this.data.bind();
    this.indices.bind();

    this.indices.draw(Buffer.DrawMethod.TriangleStrip, 4, Buffer.DataType.UnsignedByte, 0);

    this.indices.unbind();
    this.data.unbind();
  }

  clear() {
    this.data.clear();
    this.indices.clear();
  }
}

export default Surface;
