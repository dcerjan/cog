import gl from "../gl";

class Buffer {
  constructor(target, type) {
    if(
      type !== Buffer.Type.Static.Draw 
      && type !== Buffer.Type.Dynamic.Draw 
      && type !== Buffer.Type.Stream.Draw 
    ) {
      throw new Error("Buffer.constructor invalid Buffer.Type specified");
    }
    this.id = gl.createBuffer();
    this.type = type;
    this.target = target;
    this.bound = false;
  }

  data(data) {
    if(this.bound) {
      gl.bufferData(this.target, data, this.type);
    } else {
      throw new Error("Buffer.pointer cannot be called on un-bound buffer");
    }
  }

  pointer(index, components, type, offset, stride) {
    if(this.bound) {
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index, components, type, false, offset, stride);
    } else {
      throw new Error("Buffer.pointer cannot be called on un-bound buffer");
    }
  }

  clear() {
    if(this.bound) {
      gl.deleteBuffer(this.id);
    } else {
      throw new Error("Buffer.clear cannot be called while buffer is bound"); 
    }
  }

  bind() { gl.bindBuffer(this.target, this.id); this.bound = true; }
  unbind() { gl.bindBuffer(this.target, null); this.bound = false; }
}


/***************************/
/*  Comented out sections  */
/*  are not available in   */
/*  WebGL 1.0 standard     */
/***************************/

Buffer.Type = {
  Static: {
    Draw: gl.STATIC_DRAW,
    // Copy: gl.STATIC_COPY,
    // Read: gl.STATIC_READ
  },
  Dynamic: {
    Draw: gl.DYNAMIC_DRAW,
    // Copy: gl.DYNAMIC_COPY,
    // Read: gl.DYNAMIC_READ
  },
  Stream: {
    Draw: gl.STREAM_DRAW,
    // Copy: gl.STREAM_COPY,
    // Read: gl.STREAM_READ
  }
};

Buffer.Target = {
  Array:              gl.ARRAY_BUFFER,              // Vertex attributes
  // AtomicCounter:      gl.ATOMIC_COUNTER_BUFFER,     // Atomic counter storage
  // CopyRead:           gl.COPY_READ_BUFFER,          // Buffer copy source
  // CopyWrite:          gl.COPY_WRITE_BUFFER,         // Buffer copy destination
  // DispatchIndirect:   gl.DISPATCH_INDIRECT_BUFFER,  // Indirect compute dispatch commands
  // DrawIndirect:       gl.DRAW_INDIRECT_BUFFER,      // Indirect command arguments
  ElementArray:       gl.ELEMENT_ARRAY_BUFFER,      // Vertex array indices
  // PixelPack:          gl.PIXEL_PACK_BUFFER,         // Pixel read target
  // PixelUnpack:        gl.PIXEL_UNPACK_BUFFER,       // Texture data source
  // Query:              gl.QUERY_BUFFER,              // Query result buffer
  // ShaderStorage:      gl.SHADER_STORAGE_BUFFER,     //  Read-write storage for shaders
  // Texture:            gl.TEXTURE_BUFFER,            // Texture data buffer
  // TransformFeedback:  gl.TRANSFORM_FEEDBACK_BUFFER, // Transform feedback buffer
  // Uniform:            gl.UNIFORM_BUFFER             // Uniform block storage
};

Buffer.DataType = {
  Float:          gl.FLOAT,
  Half:           gl.getSupportedExtensions().some( e => e === "OES_texture_float" ) ? 0x8D61 : gl.FLOAT, // fallback to gl.FLOAT
  Int:            gl.INT,
  Short:          gl.SHORT,
  Byte:           gl.BYTE,
  UnsignedByte:   gl.UNSIGNED_BYTE,
  UnsignedShort:  gl.UNSIGNED_SHORT,
  UnsignedInt:    gl.UNSIGNED_INT
};

export default Buffer;
