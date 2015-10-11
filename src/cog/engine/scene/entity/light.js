import Entity from "./entity";
import Color from "../../renderer/color";
import guid from "../../../util/guid";
import Vector3 from "../../../math/vector3";

class Light extends Entity {
  constructor(name, color) {
    super(name ? name : guid());

    this.color = color ? color : new Color();
    this.castShadows = false;
  }
}

class Point extends Light {
  constructor(name, color, falloff) {
    super(name, color);
    this.falloff = falloff || 1.0;
  }
}

Light.Point = Point;

export default Light;
