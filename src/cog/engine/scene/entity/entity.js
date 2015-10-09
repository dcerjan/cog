import guid from "../../../util/guid";

class Entity {
  constructor(name) {
    this.name = name ? name : guid();
  }
 
  update() {}
  mount(node) {}
  unmount(node) {}
}

export default Entity;
