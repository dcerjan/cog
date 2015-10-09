import React from "react";
import Graph from "./graph/graph";
import gl from "../renderer/gl";
import Renderer from "../renderer/renderer";
import {publish} from "../../util/mediator";
import Camera from "./entity/camera";

class Scene {

  constructor(name, overlay) {
    this.name = name;

    if(overlay) {
      React.render(
        React.createElement(overlay, { scene: this }), 
        window.document.getElementById("overlay")
      );
    }

    this.graph = new Graph();
    this.camera = new Camera();

    this.graph.root.mount(this.camera);
  }

  start() {
    this.setup();

    let 
      oldTs, 
      newTs,
      milis,
      t0, t1, dt;

    oldTs = newTs = Date.now();

    let frame = () => {
      requestAnimationFrame(frame);

      t0 = window.performance.now();
      gl.reset();
      this.update();
      Renderer.render(this);
      t1 = window.performance.now();
      dt = t1 - t0;
      dt = (dt > 0 ? dt.toFixed(4) : "0.0000");

      oldTs = newTs;
      newTs = Date.now();

      milis = newTs - oldTs;

      publish("fps/update", (1000.0 / milis).toFixed(2), milis.toFixed(1), dt, gl.read());

    };
    frame();
  }

  setup()           { throw new Error("method not implemented: setup()");   }
  update()          { throw new Error("method not implemented: update()");  }
  pause()           { throw new Error("method not implemented: pause()");   }
  cleanup()         { throw new Error("method not implemented: cleanup()"); }
  toJSON()          { throw new Error("method not implemented: toJSON()");  }
}

Scene.fromJSON = (json) => {
  return new Scene(json.scene.name);
  throw new Error("static method not implemented: Scene::fromJSON(json)");
};

export default Scene;