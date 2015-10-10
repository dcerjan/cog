import Node from "./node";

import Matrix4 from "../../../math/matrix4";
import Vector3 from "../../../math/vector3";

let walk = (node, op) => {
  node.children.forEach( n => op(n) );
  node.children.forEach( n => walk(n, op) );
};

class Graph {
  constructor() {
    this.root = new Node("root");
  }

  update(dt) {
    walk(this.root, (node) => {
      if(node._dirty) {
        if(node._subTransforms.lookat) {
          let 
            localSpaceAt = node.parent ? 
              node.parent.totalTransform.inverse().transform(node._subTransforms.lookat.at) : 
              node._subTransforms.lookat.at;

          node._subTransforms.rotation = Matrix4.LookAt(
            Vector3.Zero, 
            localSpaceAt, 
            node._subTransforms.lookat.up
          ).transpose();
        }

        node.transform = node._subTransforms.rotation.mul(
          node._subTransforms.translation.mul(
            node._subTransforms.scale
          )
        );
        node._dirty = false;
      }

      if(node.parent) {
        node.totalTransform = node.parent.totalTransform.mul(node.transform);
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
