import Entity from "./entity";
import Color from "../../renderer/color";

class Light extends Entity {
  constructor(name, color) {
    super(name);

    this.color = color ? color : new Color();
    this.castShadows = false;
  }
}

export default Entity;
