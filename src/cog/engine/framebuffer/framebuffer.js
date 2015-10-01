import gl from "../gl";

let RenderTarget = {};

class RTTexture {
  constructor(width, height, format, type) {
    this.id = gl.createTexture(); gl.inc();
    gl.bindTexture(gl.TEXTURE_2D, this.id); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.inc();
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null); gl.inc();
  }

  unbind() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  delete() {
    gl.deleteTexture(this.id); gl.inc();
  }
}

class RTDepth {
  constructor(width, height) {
    this.id = gl.createRenderbuffer(); gl.inc();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.id); gl.inc();
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height); gl.inc();
  }

  unbind() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  delete() {
    gl.deleteRenderbuffer(this.id); gl.inc();
  }
}

class RTDepthTexture {
  constructor(width, height) {
    this.id = gl.createTexture(); gl.inc();
    gl.bindTexture(gl.TEXTURE_2D, this.id); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.inc();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.inc();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null); gl.inc();
  }

  unbind() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  delete() {
    gl.deleteTexture(this.id); gl.inc();
  }
}

let checkFbo = () => {
  let result = gl.checkFramebufferStatus(gl.FRAMEBUFFER); gl.inc();

  switch(result) {
    case gl.FRAMEBUFFER_COMPLETE: console.info("FrameBuffer complete"); break;
    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: console.info("FrameBuffer complete"); break;
    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: console.info("FrameBuffer complete"); break;
    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: console.info("FrameBuffer complete"); break;
    default: console.warn("FrameBuffer incomplete - unknown error");
  }
};

class FrameBuffer {
  constructor(width = 256, height = 256) {
    this.id = gl.createFramebuffer(); gl.inc();
    
    this.width = width;
    this.height = height;

    this.renderTarget = [null, null, null, null, null, null, null, null];

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id); gl.inc();
    if(Object.keys(gl.extensions).some( e => e.indexOf("_depth_texture") !== -1 )) {
      this.depthBuffer = new RTDepthTexture(width, height);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthBuffer.id, 0);
      gl.inc();
    } else {
      console.log("FrameBuffer.constructor [WEBGL_depth_texture] not available falling back to depth render buffer");
      this.depthBuffer = new RTDepth(width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer.id);
      gl.inc();
    }
  }

  addRenderTarget(index) {
    let ext = gl.extensions.WEBGL_draw_buffers;
    this.renderTarget[index] = new RTTexture(this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id); gl.inc();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + index, gl.TEXTURE_2D, this.renderTarget[index].id, 0); gl.inc();
    //checkFbo();
  }

  addRenderTargetFloat(index) {
    let ext = gl.extensions.WEBGL_draw_buffers;
    this.renderTarget[index] = new RTTexture(this.width, this.height, gl.RGBA, gl.FLOAT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id); gl.inc();
    gl.framebufferTexture2D(gl.FRAMEBUFFER,  ext.COLOR_ATTACHMENT0_WEBGL + index, gl.TEXTURE_2D, this.renderTarget[index].id, 0); gl.inc();
    //checkFbo();
  }

  begin(buffers) {
    let ext = gl.extensions.WEBGL_draw_buffers;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id); gl.inc();
    gl.viewport(0, 0, this.width, this.height); gl.inc();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.inc();
    ext.drawBuffersWEBGL(buffers.map(b => ext.COLOR_ATTACHMENT0_WEBGL + b));
  }

  end() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.inc();
  }

  delete() {
    this.renderTargets.forEach(rt => rt.delete());
    this.depthBuffer.delete();
    gl.deleteFramebuffer(this.id); gl.inc();
  }
}

export default FrameBuffer;
