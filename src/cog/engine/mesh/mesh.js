import gl from "../gl";
import Buffer from "./buffer";
import Vector3 from "../../math/vector3";
import Vector4 from "../../math/vector4";

class Vertex {
  constructor() {
    this.position = new Vector3();
    this.texCoord = new Vector4();
    this.normal   = new Vector3();
    this.tangent  = new Vector3();
  }

  equal(other) {
    return (
      this.position.equal(other.position)
      && this.texCoord.equal(other.texCoord)
      && this.normal.equal(other.normal)
      && this.tangent.equal(other.tangent)
      && this.bones.every( (val, i) => other.bones[i] === val )
      && this.weights.every( (val, i) => other.weights[i] === val )
    );
  }
}

class Polygon {
  constructor() {
    this.indices = [0, 0, 0];
    this.normal  = new Vector3();
    this.tangent = new Vector3();
  }
}

class Mesh {
  constructor() {
    this.buffer = gl.createBuffer();
    this.indices = gl.createBuffer();
    this.vertices = [];
    this.polygons = [];
  }

  calcNormals() {

  }

  calcTangents() {

  }

  compile() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
    let indices = new Uint16Array(this.polygons.reduce( (memo, poly) => {
      memo.push(poly.indices[0], poly.indices[1], poly.indices[2]);
      return memo;
    }, []));
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    let vertices = new Float32Array(this.vertices.reduce( (memo, vertex) => {
      memo.push(
        vertex.position.x, vertex.position.y, vertex.position.z,
        vertex.texCoord.x, vertex.texCoord.y, vertex.texCoord.z, vertex.texCoord.w,
        vertex.normal.x, vertex.normal.y, vertex.normal.z,
        vertex.tangent.x, vertex.tangent.y, vertex.tangent.z
      );
      return memo;
    }, []));
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  bind() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.enableVertexAttribArray(0); // position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 13);
    gl.enableVertexAttribArray(1); // texcoord
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 3, 13);
    gl.enableVertexAttribArray(2); // normal
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7, 13);
    gl.enableVertexAttribArray(3); // tangent
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 10, 13);

    gl.drawElements(gl.TRIANGLES, this.polygons.length * 3, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  cleanup() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteBuffer(this.buffer);
    gl.deleteBuffer(this.indices);
  }
}

export {Vertex, Polygon, Mesh};
