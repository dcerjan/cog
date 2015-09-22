import gl from "../gl";
import FrameBuffer from "../framebuffer";

class Effect {
  constructor(width = 1024, height = 1024, useStencilBuffer = false) {
    this.fbo = new FrameBuffer(width, height, useStencilBuffer);

  }
  process(texture) { throw new Error("Effect.process not implemented!"); }
}

export default Effect;
