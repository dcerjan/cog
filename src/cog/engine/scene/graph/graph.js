import Node from "./node";

let walk = (node, op) => {
  node.children.forEach( n => op(n) );
  node.children.forEach( n => walk(n) );
};

class Graph {
  constructor() {
    this.root = new Node("root");
  }

  update(dt) {
    walk(this.root, (node) => {
      if(node._dirty) {
        node.transform = node._subTransforms.scale.mul(
          node._subTransforms.rotation.mul(
            node._subTransforms.translation
          )
        );
        node._dirty = false;
      }

      if(node.parent) {
        node.totalTransform = parent.totalTransform.mul(node.transform);
      } else {
        node.totalTransform = node.transform;
      }

      node.update(dt);
    });
  }

  traverse(cb) {
    walk(this.root, cb);
  }
}

export default Graph;
