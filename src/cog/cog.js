import gl from "./engine/renderer/gl";

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
  Cog.Engine = {};

  
  



  import Scene from "./engine/scene/scene";
  Cog.Engine.Scene = Scene;

  import Graph from "./engine/scene/graph/graph";
  import Node from "./engine/scene/graph/node";
  Cog.Engine.Scene.Graph = Graph;
  Cog.Engine.Scene.Graph.Node = Node;
  
  
  import Entity from "./engine/scene/entity/entity";
  import Actor from "./engine/scene/entity/actor";
  import Prop from "./engine/scene/entity/prop";
  import Camera from "./engine/scene/entity/camera";
  import Light from "./engine/scene/entity/light";
  //import Emitter from "./engine/scene/entity/emitter";
  Cog.Engine.Scene.Entity = Entity;
  Cog.Engine.Scene.Entity.Actor = Actor;
  Cog.Engine.Scene.Entity.Prop = Prop;
  Cog.Engine.Scene.Entity.Camera = Camera;
  Cog.Engine.Scene.Entity.Light = Light;
  //Cog.Engine.Scene.Entity.Emitter = Emitter;

  import Renderer from "./engine/renderer/renderer";
  import Color from "./engine/renderer/color";
  import Mesh from "./engine/renderer/mesh";
  import Box from "./engine/renderer/box";
  import Sphere from "./engine/renderer/sphere";
  //import Torus from "./engine/renderer/torus";
  import Material from "./engine/renderer/material";
  import Shader from "./engine/renderer/shader";
  import {Texture2D, TextureCubeMap} from "./engine/renderer/texture";
  import Surface from "./engine/renderer/surface";
  import FrameBuffer from "./engine/renderer/framebuffer";
  Cog.Engine.Renderer = Renderer;
  Cog.Engine.Renderer.Color = Color;
  Cog.Engine.Renderer.Mesh = Mesh;
  Cog.Engine.Renderer.Mesh.Box = Box;
  Cog.Engine.Renderer.Mesh.Sphere = Sphere;
  //Cog.Engine.Renderer.Mesh.Torus = Torus;
  Cog.Engine.Renderer.Material = Material;
  Cog.Engine.Renderer.Shader = Shader;
  Cog.Engine.Renderer.Texture2D = Texture2D;
  Cog.Engine.Renderer.TextureCubeMap = TextureCubeMap;
  Cog.Engine.Renderer.Surface = Surface;
  Cog.Engine.Renderer.FrameBuffer = FrameBuffer;


/**********/
/*  Math  */
/**********/
  import MathUtil from "./math/util";
  import Vector2 from "./math/vector2";
  import Vector3 from "./math/vector3";
  import Vector4 from "./math/vector4";
  import Matrix2 from "./math/matrix2";
  import Matrix3 from "./math/matrix3";
  import Matrix4 from "./math/matrix4";
  import CatmullRomSpline2 from "./math/catmull_rom_spline2";
  import CatmullRomSpline3 from "./math/catmull_rom_spline3";

  Cog.Math = {};
  Cog.Math.Util = MathUtil;
  Cog.Math.Vector2 = Vector2;
  Cog.Math.Vector3 = Vector3;
  Cog.Math.Vector4 = Vector4;
  Cog.Math.Matrix2 = Matrix2;
  Cog.Math.Matrix3 = Matrix3;
  Cog.Math.Matrix4 = Matrix4;
  Cog.Math.CatmullRomSpline2 = CatmullRomSpline2;
  Cog.Math.CatmullRomSpline3 = CatmullRomSpline3;

/**********/
/*  Util  */
/**********/
  import Ajax from "./util/ajax";
  import Storage from "./util/storage";
  import FuzzySet from "./util/fuzzy_set";
  import Store from "./util/store";
  import Loader from "./util/loader";
  import ToHalf from "./util/half";
  import Guid from "./util/guid";

  Cog.Util = {};
  Cog.Util.Ajax = Ajax;
  Cog.Util.Storage = Storage;
  Cog.Util.FuzzySet = FuzzySet;
  Cog.Util.Store = Store;
  Cog.Util.Loader = Loader;

  Cog.Util.Helpers = {};
  Cog.Util.Helpers.ToHalf = ToHalf;
  Cog.Util.Helpers.Guid = Guid;

/**********/
/*  Core  */
/**********/
  import {publish, subscribe, unsubscribe} from "./util/mediator";

  Cog.Core = {};
  Cog.Core.publish = publish;
  Cog.Core.subscribe = subscribe;
  Cog.Core.unsubscribe = unsubscribe;

export default Cog;
