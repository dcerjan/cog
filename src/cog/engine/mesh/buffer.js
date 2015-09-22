import gl from "../gl";

import Vector2 from "../../math/vector2";
import Vector3 from "../../math/vector3";
import Vector4 from "../../math/vector4";

let ComponentType = {};
  ComponentType.Float = gl.FLOAT;
  ComponentType.Byte = gl.BYTE;
  ComponentType.Short = gl.SHORT;
  ComponentType.Int = gl.INT;
  ComponentType.UnsignedByte = gl.UNSIGNED_BYTE;
  ComponentType.UnsignedShort = gl.UNSIGNED_SHORT;
  ComponentType.UnsignedInt = gl.UNSIGNED_INT;

let ComponentDimension = {};
  ComponentDimension.One = 1;
  ComponentDimension.Two = 2;
  ComponentDimension.Three = 3;
  ComponentDimension.Four = 4;

let BufferType = {};
  BufferType.Static = gl.STATIC_DRAW;
  BufferType.Dynamic = gl.DYNAMIC_DRAW;
  BufferType.Streaming = gl.STREAM_DRAW;


class Buffer {
  constructor(
    componentSize = ComponentDimension.Three, 
    componentType = ComponentType.Float, 
    bufferType = BufferType.Static, 
    bufferData = []
  ) {
    this.id = gl.createBuffer();
    let 
      tmp = [],
      i = 0;

    this.componentSize = componentSize;
    this.componentType = componentType;
    this.bufferType = bufferType;

    this.buffer = bufferData.reduce( (memo, v) => {
      if(i < componentSize) {
        tmp.push(v);
        i++;
      } else {
        switch(componentSize) {
          case 1: memo.push(tmp[0]); break;
          case 2: memo.push(new Vector2(tmp[0], tmp[1])); break;
          case 3: memo.push(new Vector3(tmp[0], tmp[1], tmp[2])); break;
          case 4: memo.push(new Vector4(tmp[0], tmp[1], tmp[2], tmp[3])); break;
        }
        tmp = [];
        i = 0;
      }
      return memo;
    }, []);
  }

  compile() {
    this.bind();
    let buffer = this.buffer.reduce( (memo, v) => {
      switch(this.componentSize) {
        case ComponentDimension.One: memo.push(v.x); break;
        case ComponentDimension.Two: memo.push(v.x, v.y); break;
        case ComponentDimension.Three: memo.push(v.x, v.y, v.z); break;
        case ComponentDimension.Four: memo.push(v.x, v.y, v.z, v.w); break;
      }
      return memo;
    }, []);

    switch(this.componentType) {
      case ComponentType.Float: buffer = new Float32Array(buffer); break;
      case ComponentType.Byte: buffer = new Int8rray(buffer); break;
      case ComponentType.Short: buffer = new Int16rray(buffer); break;
      case ComponentType.Int: buffer = new Int832ray(buffer); break;
      case ComponentType.UnsignedByte: buffer = new Uint8rray(buffer); break;
      case ComponentType.UnsignedShort: buffer = new Uint16rray(buffer); break;
      case ComponentType.UnsignedInt: buffer = new Uint832ray(buffer); break;
    }

    gl.bufferData(gl.ARRAY_BUFFER, buffer, this.bufferType);
    this.unbind();
  }

  bind() { gl.bindBuffer(gl.ARRAY_BUFFER, this.id); }
  unbind() { gl.bindBuffer(gl.ARRAY_BUFFER, null); }
  clear() { this.buffer = []; }
  add(element) { this.buffer.push(element); }
}
