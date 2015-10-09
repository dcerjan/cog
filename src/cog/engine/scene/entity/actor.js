import Mesh from "../../renderer/mesh";
import Material from "../../renderer/material";
//import Animation from "../../renderer/animation";

import Entity from "./entity";

class Actor extends Entity {
  constructor(name, mesh = null, material = null /*, animation = null*/) {
    super(name);

    this.mesh = mesh ? mesh : new Mesh(Mesh.Type.Stream);
    this.material = material ? material : new Material();
    //this.animation = animation ? animation : new Animation();
  }
}

export default Actor;
