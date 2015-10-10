import Cog from "./cog/cog";
import React from "react";


let Box = Cog.Engine.Renderer.Mesh.Box;
let Material = Cog.Engine.Renderer.Material;
let Prop = Cog.Engine.Scene.Entity.Prop;
let Node = Cog.Engine.Scene.Graph.Node;
let Vec3 = Cog.Math.Vector3;


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

    let img = new Image();
    this.props.scene.tex = gl.createTexture();

    img.onload = () => {

      let ext = gl.getExtension("EXT_texture_filter_anisotropic");
      let max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

      gl.bindTexture(gl.TEXTURE_2D, this.props.scene.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);

      console.info("texture created");
      this.props.scene.start();
    };

    img.src = "assets/images/test/ash_uvgrid_1024.jpg";
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
MySceneOverlay.propTypes = { scene: React.PropTypes.instanceOf(Cog.Engine.Scene) };



class MyScene extends Cog.Engine.Scene {
  constructor() {
    super("my scene", MySceneOverlay);
    this.store = new Cog.Util.Store();
  }

  setup() {
    this.box = new Prop("box", new Box(1,1,1), new Material());
    this.env = new Prop("env", new Box(1,1,1, true), new Material());
    this.box.material.diffuse.map = {id: this.tex};
    this.env.material.diffuse.map = {id: this.tex};

    this.node = new Node("boxnode");
    this.node.mount(this.box);
    this.node.translate(new Vec3(0,0.5,0));

    let env = new Node("envnode");
    env.scale(new Vec3(10,10,10));
    env.translate(new Vec3(0,5,0));
    env.mount(this.env);

    let 
      cam = {
        pos: new Node("campos"),
        node: new Node("cammount")
      };

    cam.pos.append(cam.node);
    cam.node.mount(this.camera);
    cam.pos.translate(new Vec3(5,5,5));

    this.graph.root.append(env);
    this.graph.root.append(this.node);
    this.graph.root.append(cam.pos);
  }

  update(dt) {
    this.camera.node.lookAt(new Vec3(0,0,0));

    this.node.rotate(Vec3.Y, Date.now() * 0.001);
    //this.node.scale(new Vec3(0.5 + 0.5 * Math.cos(Date.now() * 0.01), 1.0, 1.0));
  }
}



let game = new Cog(MyScene);