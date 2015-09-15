import gl from "./gl";
import Ajax from "./ajax";
import Loader from "./loader";
import Scene from "./scene";
import Storage from "./storage";


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

Cog.Ajax = Ajax;
Cog.Scene = Scene;
Cog.Storage = Storage;
Cog.Loader = Loader;

export default Cog;
