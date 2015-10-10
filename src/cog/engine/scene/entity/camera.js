import Matrix4 from "../../../math/matrix4";
import Vector3 from "../../../math/vector3";
import guid from "../../../util/guid";
import Entity from "./entity";

class Camera extends Entity {
  constructor(name, fovy = 60.0, ratio = 1.6, near = 0.1, far = 100.0) {
    super(name ? name : guid());
    this.projection = Matrix4.Perspective(fovy, ratio, near, far);
  }

  mount(node) {
    this.node = node;
  }

  unmount(node) {
    this.node = null;
  }
}

export default Camera;
