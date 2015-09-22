import Cog from "./cog/cog";
import React from "react";

import gl from "./cog/engine/gl";

class MySceneOverlay extends React.Component {
  constructor(props) {
    super(props);

    let loader = new Cog.Engine.Loader("http://localhost:8000/assets/shaders");
    loader.load(
      ["raymarch/raymarch.frag", "raymarch/raymarch.vert"], 
      (name, _) => { console.log("Resource " + name + " loaded"); },
      () => { 
        let shader = new Cog.Engine.Shader("raymarch example", loader.get("raymarch/raymarch.vert"), loader.get("raymarch/raymarch.frag"));
        this.props.scene.store.set("raymarch example shader", shader);
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
  }
}



let game = new Cog(MyScene);