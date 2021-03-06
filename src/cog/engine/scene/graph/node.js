import Matrix4 from "../../../math/matrix4";
import Vector3 from "../../../math/vector3";
import guid from "../../../util/guid";

class Node {
  constructor(name, parent = null) {
    this.name = name ? name : guid();
    this.transform = Matrix4.Identity();
    this.totalTransform = Matrix4.Identity();

    this._dirty = true;
    this._subTransforms = {
      translation: Matrix4.Identity(),
      rotation: Matrix4.Identity(),
      scale: Matrix4.Identity()
    };

    this.parent = parent;

    this.children = [];
    this.entity = [];
  }

  findChild(name) {
    for(let i = 0; i < this.children.length; ++i) {
      if(this.children[i].name === name) {
        return this.children[i];
      } else {
        let child = this.children[i].findChild(name); 
        if(child && child.name === name) {
          return child;
        }
      }
    }
    return null;
  }

  remove(node) {
    let len = this.children.length;
    this.children = this.children.filter( n => n !== node );
    if(len === this.children.length) {
      throw new Error("Node.remove can't remove node " + node.name + "which is not a child node of " + this.name);
    }
    return this;
  }

  append(node) {
    this.children.push(node);
    node.parent = this;

    return this;
  }

  translate(vec) {
    this._dirty = true;
    this._subTransforms.lookat = null;
    this._subTransforms.translation = Matrix4.Translation(vec);

    return this;
  }

  rotate(axis, angle) {
    this._dirty = true;
    this._subTransforms.lookat = null;
    this._subTransforms.rotation = Matrix4.Rotation(axis, angle);

    return this;
  }

  scale(vec) {
    this._dirty = true;
    this._subTransforms.lookat = null;
    this._subTransforms.scale = Matrix4.Scale(vec.x, vec.y, vec.z);

    return this;
  }

  lookAt(at, up = new Vector3(0,1,0)) {
    this._dirty = true;
    this._subTransforms.lookat = { at, up };
    this._subTransforms.rotation = Matrix4.Identity();
    this._subTransforms.translation = Matrix4.Identity();
    this._subTransforms.scale = Matrix4.Identity();

    return this;
  }

  update(dt) {
    this.entity.forEach( e => e.update(dt) );
  }

  getPosition(local = true) {
    let
      localPosition = new Vector3(this.transform.m[12], this.transform.m[13], this.transform.m[14]);

    if(local || !this.parent) { return localPosition; }

    return this.parent.totalTransform.transform(localPosition);
  }

  mount(entity) {
    this.entity.push(entity);
    entity.mount(this);

    return this;
  }

  unmount(entity) {
    let len = this.entity.length;
    this.entity = this.entity.filter( (e) => {
      if(e !== entity) {
        return true;
      }
      entity.unmount(this);
      return false;
    });

    if(len === this.entity.length) {
      throw new Error("Node.unmount can't unmount entity " + entity.name + "which is not a part of node of " + this.name);
    }

    return this;
  }
}

export default Node;
