import Mesh from "../../renderer/mesh";
import Material from "../../renderer/material";

import Entity from "./entity";

class Prop extends Entity {
  constructor(name, mesh = null, material = null) {
    super(name);

    this.mesh = mesh ? mesh : new Mesh(Mesh.Type.Static);
    this.material = material ? material : new Material();
  }
}

export default Prop;
