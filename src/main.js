import Cog from "./cog/cog";
import React from "react";

import gl from "./cog/engine/gl";

class MySceneOverlay extends React.Component {
  constructor(props) {
    super(props);

    let loader = new Cog.Engine.Loader("/assets/shaders");
    loader.load(
      ["blit/blit.frag", "blit/blit.vert"], 
      (name, _) => { console.log("Resource " + name + " loaded"); },
      () => { 
        let shader = new Cog.Engine.Shader("blit example", loader.get("blit/blit.vert"), loader.get("blit/blit.frag"));
        this.props.scene.store.set("blit example shader", shader);
        this.props.scene.shader = this.props.scene.store.get("blit example shader");
        this.props.scene.surface = new Cog.Engine.Surface(-0.5, -0.5, 1.0, 1.0);
        

        this.props.scene.start();

        console.log(this.props.scene);
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
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.enable(gl.DEPTH_TEST);
  }

  update() {

  }

  render() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.shader.bind();
    this.surface.blit();
    this.shader.unbind();
  }
}



let game = new Cog(MyScene);