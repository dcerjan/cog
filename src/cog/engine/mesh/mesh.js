import gl from "../gl";
import Buffer from "./buffer/buffer";
import DataBuffer from "./buffer/index_buffer";
import IndexBuffer from "./buffer/data_buffer";
import Vector3 from "../../math/vector3";
import Vector4 from "../../math/vector4";

class Vertex {
  constructor() {
    this.position = null;  // passed as a 3-component float attribute [0]
    this.texCoord = null;  // passed as a 4-component uint16 attribute [1]
    this.normal   = null;  // passed as a 3-component uint8 attribute [2]
    this.tangent  = null;  // passed as a 3-component uint8 attribute [3]
    //this.bones    = [];    // passed as a 4-component uint16 attribute [4] - 65536 bones
    //this.weights  = [];    // passed as a 4-component uint8 attribute [5]
    this.color    = null;  // passed as a 4-component uint8 attribute [6] 
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
  constructor(meshType) {
    if(meshType !== Mesh.Type.Static || meshType !== Mesh.Type.Dynamic || meshType !== Mesh.Type.Stream) {
      throw new Error("Mesh.constructor argument meshType must be something of [Mesh.Type.Static, Mesh.Type.Dynamic, Mesh.Type.Stream]");
    }

    this.meshType = meshType;
    this.dataFp32 = new DataBuffer(this.meshType);
    this.dataUint8 = new DataBuffer(this.meshType);
    this.dataUint16 = new DataBuffer(this.meshType);
    this.indices = new IndexBuffer();

    this.vertices = [];
    this.polygons = [];
  }

  calcNormals() {
    let v0, v1;
    // for each vertex index
    this.vertices.forEach( (v, i) => {
       v.normal = new Vector3();
      // find all polygons which have that vertex in common
      this.polygons.forEach( (p) => {
        if(p.indices.some(index => index === i)) {
          // calculate normal for this polygon
          v0 = this.vertices[p.indices[1]].sub(this.vertices[p.indices[0]]);
          v1 = this.vertices[p.indices[2]].sub(this.vertices[p.indices[0]]);
          p.normal = v0.cross(v1).normalize();
          // accumulate normal vector at that vertex
          v.normal = v.normal.add(p.normal);
        }
      });
      // normalize vertex normal
      v.normal = v.normal.normalize();
    });
  }

  calcTangents() {
    let
      accum = new Vector3(),
      v0, v1, v2,
      e1, e2,
      deltaU1, deltaV1, deltaU2, deltaV2, f;

    // for each polygon
    this.polygons.forEach((p, i) => {
      // calculate polygon tangent
      v0 = this.vertices[p.indices[0]];
      v1 = this.vertices[p.indices[1]];
      v2 = this.vertices[p.indices[2]];
      
      e1 = v1.position.sub(v0.position);
      e2 = v2.position.sub(v0.position);
      
      deltaU1 = (v1.texCoord.x - v0.texCoord.x);
      deltaV1 = (v1.texCoord.y - v0.texCoord.y);
      deltaU2 = (v2.texCoord.x - v0.texCoord.x);
      deltaV2 = (v2.texCoord.y - v0.texCoord.y);
      
      f = 1.0 / (deltaU1 * deltaV2 - deltaU2 * deltaV1);
      
      accum.x = f * (deltaV2 * e1.x - deltaV1 * e2.x);
      accum.y = f * (deltaV2 * e1.y - deltaV1 * e2.y);
      accum.z = f * (deltaV2 * e1.z - deltaV1 * e2.z);
      
      this.polygons[i].tangent = Vector3Normalized(accum);
    });

    // for each vertex index
    this.vertices.forEach( (v, i) => {
       v.tangent = new Vector3();
      // find all polygons which have that vertex in common
      this.polygons.forEach( (p) => {
        if(p.indices.some(index => index === i)) {
          // accumulate tangent vector at that vertex
          v.tangent = v.tangent.add(p.tangent);
        }
      });
      // normalize tangent vector
      v.tangent = v.tangent.normalize();
    });
  }

  compile() {
    let
      texcoords = this.vertices.every(v => !!v.texCoord),
      normals   = this.vertices.every(v => !!v.normal),
      tangents  = this.vertices.every(v => !!v.tangent),
      colors    = this.vertices.every(v => !!v.color);
      //bones     = this.vertices.every(v => v.bones.length > 0),
      //weights   = this.vertices.every(v => v.weights.length > 0);


    this.dataFp32.bind();
    this.dataFp32.data(
      new Float32Array(this.vertices.reduce( (memo, v) => {
        memo.push(v.position.x, v.position.y, v.position.z);
      }, []))
    );
    this.dataFp32.pointer(0, 3, Buffer.DataType.Float, false, 0, 0);
    this.dataFp32.unbind();

    this.dataUint16.bind();
    this.dataUint16.data(
      new Uint16Array(this.vertices.reduce( (memo, v) => {
        texcoords && memo.push(v.texCoord.x, v.texCoord.y, v.texCoord.z, v.texCoord.w);
        //bones     && memo.push(...v.bones);
      }, []))
    );
    this.dataUint16.pointer(1, 4, Buffer.DataType.UnsignedShort, true, 0, 0);
    //this.dataUint16.pointer(5, 4, Buffer.DataType.UnsignedShort, false, 8 + 8, 8);
    this.dataUint16.unbind();

    this.dataUint8.bind();
    this.dataUint8.data(
      new Uint8Array(this.vertices.reduce( (memo, v) => {
        normals   && memo.push(v.normal.x * 0.5 + 0.5, v.normal.y * 0.5 + 0.5, v.normal.z * 0.5 + 0.5);
        tangents  && memo.push(v.tangent.x * 0.5 + 0.5, v.tangent.y * 0.5 + 0.5, v.tangent.z * 0.5 + 0.5);
        colors    && memo.push(v.color.x, v.color.y, v.color.z, v.color.w);
        //weights   && memo.push(...v.weights);
      }, []))
    );
    this.dataUint8.pointer(2, 3, Buffer.DataType.UnsignedByte,  true, 10, 0);
    this.dataUint8.pointer(3, 3, Buffer.DataType.UnsignedByte,  true, 10, 3);
    this.dataUint8.pointer(4, 4, Buffer.DataType.UnsignedByte, false, 10, 6);
    //this.dataUint8.pointer(6, 4, Buffer.DataType.Float, true, 10 + 4, 10);
    this.dataUint8.unbind();

    this.indices.bind();
    this.indices.data(
      this.polygons.reduce( (memo, p) => {
        memo.push(...p.indices);
      }, [])
    );
    this.indices.unbind();
  }

  draw() {
    this.dataFp32.bind();
    this.dataUint16.bind();
    this.dataUint8.bind();

    this.indices.bind();
    this.indices.draw(Buffer.DrawMethod.Triangles, this.vertices.length, 0);
    this.indices.unbind();

    this.dataFp32.unbind();
    this.dataUint16.unbind();
    this.dataUint8.unbind();
  }

  cleanup() {
    this.dataFp32.cleanup();
    this.dataUint16.cleanup();
    this.dataUint8.cleanup();
    this.indices.cleanup();
  }
}

Mesh.Type = {
  Static:   Buffer.Type.Static.Draw,
  Dynamic:  Buffer.Type.Dynamic.Draw,
  Stream:   Buffer.Type.Stream.Draw
};

export {Vertex, Polygon, Mesh};
