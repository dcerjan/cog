import Cog from "./cog/cog";
import React from "react";

import gl from "./cog/engine/gl";

class MySceneOverlay extends React.Component {
  constructor(props) {
    super(props);

    let loader = new Cog.Engine.Loader("assets/shaders");
    loader.load(
      ["blit/blit.frag", "blit/blit.vert", "deferred/bake.vert", "deferred/bake.frag"], 
      (name, _) => { console.log("Resource " + name + " loaded"); },
      () => { 
        let shader = new Cog.Engine.Shader("blit example", loader.get("blit/blit.vert"), loader.get("blit/blit.frag"));
        let bake = new Cog.Engine.Shader("bake example", loader.get("deferred/bake.vert"), loader.get("deferred/bake.frag"));
        this.props.scene.store.set("blit example shader", shader);
        this.props.scene.store.set("bake example shader", bake);
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
    this.bake = this.store.get("bake example shader");
    this.surface = new Cog.Engine.Surface(0.0, 0.0, 1.0, 1.0);
    this.spline = new Cog.Math.CatmullRomSpline2();
    this.mesh = new Cog.Engine.Mesh(Cog.Engine.Mesh.Type.Static);

    this.mesh.vertices.push(
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3(-1.0, -1.0, 0.0), null, null, 
        new Cog.Math.Vector4(1.0, 0.0, 0.0, 1.0), 
        new Cog.Math.Vector4(0.0, 0.0, 0.0, 0.0)
      ),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3( 1.0, -1.0, 0.0), null, null, 
        new Cog.Math.Vector4(0.0, 1.0, 0.0, 1.0), 
        new Cog.Math.Vector4(0.0, 0.0, 0.0, 0.0)
      ),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3( 1.0,  1.0, 0.0), null, null, 
        new Cog.Math.Vector4(0.0, 0.0, 0.0, 1.0), 
        new Cog.Math.Vector4(0.0, 0.0, 0.0, 0.0)
      ),
      new Cog.Engine.Mesh.Vertex(new Cog.Math.Vector3(-1.0,  1.0, 0.0), null, null, 
        new Cog.Math.Vector4(1.0, 1.0, 1.0, 1.0), 
        new Cog.Math.Vector4(0.0, 0.0, 0.0, 0.0)
      )
    );

    this.mesh.polygons.push(
      new Cog.Engine.Mesh.Polygon([0, 1, 2]),
      new Cog.Engine.Mesh.Polygon([0, 2, 3])
    );

    this.mesh.calcNormals();
    this.mesh.calcTangents();
    this.mesh.compile();

    // just for clarification: 9 here is intentional
    // NEVER EVER use NPOT textures
    this.fbo = new Cog.Engine.FrameBuffer(16, 9);
    this.fbo.addRenderTarget(0);

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.enable(gl.DEPTH_TEST);

    console.log(this);
  }

  update() {

  }

  render() {
    
    this.fbo.begin();
      this.bake.bind();
      this.surface.blit();
    this.fbo.end();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.shader.bind();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fbo.renderTarget[0].id);
    this.shader.links.sampler2D("fTexChannel0", 0);
    //gl.uniform1i(this.shader.uniform.samplerUniform, 0);

    this.surface.blit();
    //this.mesh.draw();

    this.shader.unbind();
  }
}



let game = new Cog(MyScene);