import React from "react";

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
    
    let everyTick = () => {
      requestAnimationFrame(everyTick);
      this.update();
      this.render();
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