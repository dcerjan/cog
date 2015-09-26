import Cog from "./cog/cog";
import React from "react";

import gl from "./cog/engine/gl";

class MySceneOverlay extends React.Component {
  constructor(props) {
    super(props);

    let loader = new Cog.Engine.Loader("assets/shaders");
    loader.load(
      ["blit/blit.frag", "blit/blit.vert"], 
      (name, _) => { console.log("Resource " + name + " loaded"); },
      () => { 
        let shader = new Cog.Engine.Shader("blit example", loader.get("blit/blit.vert"), loader.get("blit/blit.frag"));
        this.props.scene.store.set("blit example shader", shader);
        this.props.scene.start();
      }
    );
  }

  render() {
    return (
      <div>
        <span>
          {this.props.scene.name}
        </span>
      </div>
    );
  }
}



class MyScene extends Cog.Engine.Scene {
  constructor() {
    super("my scene", MySceneOverlay);
    this.store = new Cog.Util.Store();
  }

  setup() {
    this.shader = this.store.get("blit example shader");
    this.surface = new Cog.Engine.Surface(0.0, 0.0, 1.0, 1.0);
    this.spline = new Cog.Math.CatmullRomSpline2();
    this.mesh = new Cog.Engine.Mesh(Cog.Engine.Mesh.Type.Static);

    this.mesh.vertices.push(
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3(-1.0, -1.0, 0.0), null, null, new Cog.Math.Vector4(1.0, 0.0, 0.0, 1.0)),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3( 1.0, -1.0, 0.0), null, null, new Cog.Math.Vector4(0.0, 1.0, 0.0, 1.0)),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3( 1.0,  1.0, 0.0), null, null, new Cog.Math.Vector4(0.0, 0.0, 0.0, 1.0)),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3(-1.0,  1.0, 0.0), null, null, new Cog.Math.Vector4(1.0, 1.0, 1.0, 1.0))
    );

    this.mesh.polygons.push(
      new Cog.Engine.Mesh.Polygon([0, 1, 2]),
      new Cog.Engine.Mesh.Polygon([0, 2, 3])
    );

    //this.mesh.calcNormals();
    this.mesh.compile();

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.enable(gl.DEPTH_TEST);

    console.log(this);
  }

  update() {

  }

  render() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.shader.bind();
    
    this.surface.blit();
    //this.mesh.draw();

    this.shader.unbind();
  }
}



let game = new Cog(MyScene);