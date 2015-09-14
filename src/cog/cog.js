import gl from "./gl";
import Scene from "./scene";


class Cog {
  constructor(scene) {
    if(gl) {
      if(scene) {
        this.scene = new scene();
      } else {
        throw new Error("scene is not defined!");
      }
    }
  }
}

Cog.Scene = Scene;

export default Cog;
