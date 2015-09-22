import gl from "./engine/gl";
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

/************/
/*  Engine  */
/************/
import Loader from "./engine/loader";
import Scene from "./engine/scene";
import {Texture2D, TextureCubeMap} from "./engine/texture/texture";
import Buffer from "./engine/buffer/buffer";

Cog.Engine = {};
Cog.Engine.Loader = Loader;
Cog.Engine.Scene = Scene;
Cog.Engine.Texture2D = Texture2D;
Cog.Engine.TextureCubeMap = TextureCubeMap;
Cog.Engine.Buffer = Buffer;

/**********/
/*  Math  */
/**********/
import * as MathUtils from "./math/util";
import Vector2 from "./math/vector2";
import Vector3 from "./math/vector3";

Cog.Math = {};
Cog.Math.Util = MathUtils;
Cog.Math.Vector2 = Vector2;
Cog.Math.Vector3 = Vector3;

/**********/
/*  Util  */
/**********/
import Ajax from "./util/ajax";
import Storage from "./util/storage";
import FuzzySet from "./util/fuzzy_set";

Cog.Util = {};
Cog.Util.Ajax = Ajax;
Cog.Util.Storage = Storage;
Cog.Util.FuzzySet = FuzzySet;

export default Cog;
