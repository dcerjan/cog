import Cog from "./cog/cog";
import React from "react";
import Chart from "chart";

import gl from "./cog/engine/gl";


class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timeline: [[0.0, 0.0, 0.0]],
      fps: 0.0, 
      milis: 0.0, 
      milisPerFrame: 0.0,
      calls: 0
    };

    this.updateStats = (fps, milis, milisPerFrame, calls) => {
      this.setState({fps, milis, milisPerFrame, calls});
    };
  }

  componentDidMount() {
    Cog.Core.subscribe("fps/update", this.updateStats);
  }

  componentWillUnmount() {
    Cog.Core.unsubscribe("fps/update", this.updateStats);
  }

  render() {
    return (
      <div className="stats-container">
        <div className="stats-legend">
          <span className="stats-label">{"FPS: " + this.state.fps + " fps"}</span>
          <span className="stats-label">{"AFT: " + this.state.milis + "ms"}</span>
          <span className="stats-label">{"TPF: " + this.state.milisPerFrame + "ms"}</span>
          <span className="stats-label">{"WebGL calls: " + this.state.calls}</span>
        </div>
        <div className="stats-graph">
        </div>
      </div>
    );
  }
}



class MySceneOverlay extends React.Component {
  constructor(props) {
    super(props);

    let loader = new Cog.Engine.Loader("assets/shaders");
    loader.load(
      ["blit/blit.frag", "blit/blit.vert", "deferred/bake.vert", "deferred/bake.frag", "deferred/debug/normal.frag", "deferred/debug/diffuse.frag"], 
      (name, _) => { console.log("Resource " + name + " loaded"); },
      () => { 
        let shader = new Cog.Engine.Shader("blit example", loader.get("blit/blit.vert"), loader.get("blit/blit.frag"));
        let bake = new Cog.Engine.Shader("bake example", loader.get("deferred/bake.vert"), loader.get("deferred/bake.frag"));
        let debugNormal = new Cog.Engine.Shader("debug normal", loader.get("blit/blit.vert"), loader.get("deferred/debug/normal.frag"));
        let debugDiffuse = new Cog.Engine.Shader("debug normal", loader.get("blit/blit.vert"), loader.get("deferred/debug/diffuse.frag"));
        this.props.scene.store.set("blit example shader", shader);
        this.props.scene.store.set("bake example shader", bake);
        this.props.scene.store.set("debug normal", debugNormal);
        this.props.scene.store.set("debug diffuse", debugDiffuse);

        let img = new Image();
        this.props.scene.tex = gl.createTexture();

        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, this.props.scene.tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.bindTexture(gl.TEXTURE_2D, null);

          console.info("texture created");
          this.props.scene.start();
        };

        img.src = "assets/images/test/ash_uvgrid_1024.jpg";
      }
    );
  }

  render() {
    return (
      <div>
        <Stats/>

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
    this.material = new Cog.Engine.Material("example material");
    this.material.diffuse.map = {id: this.tex};

    this.debugNormal = this.store.get("debug normal");
    this.debugDiffuse = this.store.get("debug diffuse");

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

    this.box = Cog.Engine.Mesh.Box(1,1,1);
    this.env = Cog.Engine.Mesh.Box(1,1,1,true);

    // just for clarification: 9 here is intentional
    // NEVER EVER use NPOT textures with
    // mipmaps and non gl.NEAREST or gl.LINEAR filtering
    // framebuffer textures here have no mipmaps generated and
    // filtering set to gl.NEAREST
    // https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences

    let resolution = [2880, 1800], scale = 0.5;

    this.fbo = new Cog.Engine.FrameBuffer(resolution[0] * scale, resolution[1] * scale);
    this.fbo.addRenderTargetFloat(0);
    this.fbo.addRenderTarget(1);
    this.fbo.addRenderTarget(2);
    this.fbo.addRenderTarget(3);
    this.fbo.addRenderTarget(4);
    this.fbo.addRenderTargetFloat(5);

    gl.clearColor(0.7, 0.7, 0.7, 1.0); gl.inc();
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST); gl.inc();
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);


    this.debug = {
      position: new Cog.Engine.Surface(0.0, 0.8, 0.15, 0.2),
      depth: new Cog.Engine.Surface(0.15, 0.8, 0.15, 0.2),
      normal: new Cog.Engine.Surface(0.3, 0.8, 0.15, 0.2),
      color: new Cog.Engine.Surface(0.45, 0.8, 0.15, 0.2),
      specular: new Cog.Engine.Surface(0.6, 0.8, 0.15, 0.2),
      glow: new Cog.Engine.Surface(0.75, 0.8, 0.15, 0.2),
      environment: new Cog.Engine.Surface(0.9, 0.8, 0.1, 0.2)
    };

    window.Vec3 = Cog.Math.Vector3;
    window.Mat4 = Cog.Math.Matrix4;
    window.r = Mat4.Rotation(new Vec3(0,1,0), 0 && Date.now() * 0.001);
    window.m = Mat4.Translation(new Cog.Math.Vector3(0.0, 0.0, 0.0));
    window.v = Mat4.LookAt(new Vec3(2.0, 2.0, 4.0), new Vec3(0.0, 0.0, 0.0), new Vec3(0.0, 1.0, 0.0));
    window.p = Mat4.Perspective(60.0, 1.6, 0.5, 100.0);
    window.eye = new Vec3(5,5,5);
    window.to = new Vec3(0,0,0);
    window.up = new Vec3(0,1,0);
    console.log(this);
  }

  update(dt) {

  }

  render() {
    this.fbo.begin([0,1,2,3,4,5]);
    this.bake.bind();
    this.material.bind(this.bake);

    //this.bake.links.mat4("uModelView", (
    //  new Cog.Math.Matrix4.Scale(0.4, 0.4, 0.4)).mul(
    //    new Cog.Math.Matrix4.Rotation(new Cog.Math.Vector3(0.0, 0.0, 0.0), 0.0 * Math.cos(Date.now() * 0.001)).mul(
    //      new Cog.Math.Matrix4.Translation(new Cog.Math.Vector3(0.0, 0.0, -8.0))
    //    )
    //  )
    //);

    window.r = Mat4.Rotation(new Vec3(0,1,0), Date.now() * 0.001);

    this.bake.links.mat4("uModelView", v.mul(m.mul(r)));
    this.bake.links.mat4("uProjection", p);

    this.box.draw();

    this.bake.links.mat4("uModelView", v.mul(Mat4.Translation(new Vec3(0,4.5,0)).mul(Mat4.Scale(10,10,10))));

    this.env.draw();

    this.fbo.end();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); gl.inc();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.inc();
    

    
    // debug
    this.debugNormal.bind();
    this.debugNormal.texture2D(0, this.fbo.renderTarget[1]);
    this.debugNormal.links.sampler2D("fTexChannel0", 0);
    this.debug.normal.blit();

    this.debugDiffuse.bind();
    this.debugDiffuse.texture2D(0, this.fbo.renderTarget[2]);
    this.debugDiffuse.links.sampler2D("fTexChannel0", 0);
    this.debug.color.blit();

    this.shader.bind();
    this.shader.texture2D(0, this.fbo.renderTarget[0]);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.debug.position.blit();

    this.shader.texture2D(0, this.fbo.depthBuffer);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.debug.depth.blit();

    this.shader.texture2D(0, this.fbo.renderTarget[3]);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.debug.specular.blit();

    this.shader.texture2D(0, this.fbo.renderTarget[4]);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.debug.glow.blit();

    this.shader.texture2D(0, this.fbo.renderTarget[5]);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.debug.environment.blit();


    // blit
    this.shader.texture2D(0, this.fbo.renderTarget[2]);
    this.shader.links.sampler2D("fTexChannel0", 0);
    this.surface.blit();

    this.fbo.renderTarget.forEach(rt => rt && rt.unbind());

    //this.mesh.draw();
  }
}



let game = new Cog(MyScene);