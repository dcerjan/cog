import React from "react";
import {publish} from "../util/mediator";

class Scene {

  constructor(name, overlay) {
    this.name = name;

    if(overlay) {
      React.render(
        React.createElement(overlay, { scene: this }), 
        window.document.getElementById("overlay")
      );
    }
  }

  start() {
    this.setup();

    let 
      oldTs, 
      newTs, 
      frames = [0, 0, 0, 0, 0];

    oldTs = newTs = Date.now();

    let everyTick = () => {
      requestAnimationFrame(everyTick);
      this.update();
      this.render();
      
      oldTs = newTs;
      newTs = Date.now();
      
      frames = frames.slice(1);
      frames.push(newTs - oldTs);

      let milis = frames.reduce( (m, f) => { m += f; return m; }, 0) * 0.2;

      publish("fps/update", (1000.0 / milis).toFixed(2), milis.toFixed(1));

    };
    everyTick();
  }

  setup()           { throw new Error("method not implemented: setup()");   }
  update()          { throw new Error("method not implemented: update()");  }
  render()          { throw new Error("method not implemented: render()");  }
  pause()           { throw new Error("method not implemented: pause()");   }
  cleanup()         { throw new Error("method not implemented: cleanup()"); }
  toJSON()          { throw new Error("method not implemented: toJSON()");  }
}

Scene.fromJSON = (json) => {
  return new Scene(json.scene.name);
  throw new Error("static method not implemented: Scene::fromJSON(json)");
};

export default Scene;