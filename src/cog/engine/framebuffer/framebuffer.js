import gl from "../gl";

let RenderTarget = {};

class RTTexture {
  constructor(width, height, format, type) {
    this.id = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null);
  }

  delete() {
    gl.deleteTexture(this.id);
  }
}

class RTDepth {
  constructor(width, height) {
    this.id = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.id);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }

  delete() {
    gl.deleteRenderbuffer(this.id);
  }
}

class RTDepthTexture {
  constructor(width, height) {
    this.id = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.deleteTexture(this.id);
  }

  delete() {
    gl.deleteTexture(this.id);
  }
}

class FrameBuffer {
  constructor(width = 256, height = 256) {
    this.id = gl.createFramebuffer();
    
    this.width = width;
    this.height = height;

    this.renderTarget = [null, null, null, null, null, null, null, null];

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    if(gl.extensions.some( e => e.indexOf("_depth_texture") !== -1 )) {
      this.depthBuffer = new RTDepthTexture(width, height);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthBuffer.id, 0);
    } else {
      console.log("FrameBuffer.constructor [WEBGL_depth_texture] not available falling back to depth render buffer");
      this.depthBuffer = new RTDepth(width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer.id);
    }
  }

  addRenderTarget(index) {
    this.renderTarget[index] = new RTTexture(this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, this.renderTarget[index].id, 0);
  }

  addRenderTargetFloat(index) {
    this.renderTarget[index] = new RTTexture(this.width, this.height, gl.RGBA, gl.FLOAT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, this.renderTarget[index].id, 0);
  }

  begin() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.viewport(0, 0, this.width, this.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  end() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  delete() {
    this.renderTargets.forEach(rt => rt.delete());
    this.depthBuffer.delete();
    gl.deleteFramebuffer(this.id);
  }
}

export default FrameBuffer;
