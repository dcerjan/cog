import Buffer from "../buffer/buffer";
import IndexBuffer from "../buffer/index_buffer";
import DataBuffer from "../buffer/data_buffer";
import Vector3 from "../../math/vector3";

class Vertex {
  constructor(
    position    = null,
    normal      = null,
    tangent     = null,
    color       = null,
    texCoord    = null,
    texCoordAlt = null,
    bones       = [-1,-1,-1,-1],
    weights     = [-1,-1,-1,-1]
  ) {
    // order of vertex attributes is always the same, attribute locations are always indexed acording to this order
    this.position     = position;    //  16  // passed as a 3-component float attribute  [0] - 32 bits per channel; one 32 bit padding value (1.0)
    this.normal       = normal;      //   4  // passed as a 3-component uint8 attribute  [1] - 24 bits with 8 bit padding value (128 normalized to 0.5)
    this.tangent      = tangent;     //   4  // passed as a 3-component uint8 attribute  [2] - 24 bits with 8 bit padding value (128 normalized to 0.5)
    this.color        = color;       //   4  // passed as a 4-component uint8 attribute  [3] - 8 bits per channel
    this.texCoord     = texCoord;    //   8  // passed as a 4-component uint16 attribute [4] - 16 bits per coordinate gives us 65536x65536 resolution - more than enough
    this.texCoordAlt  = texCoordAlt; //   8  // passed as a 4-component uint16 attribute [5] - 16 bits per coordinate gives us 65536x65536 resolution - more than enough
    this.bones        = bones;       //   4  // passed as a 4-component uint8 attribute  [6] - 255 bones; grown human body has 206 bones, so this will suffice
    this.weights      = weights;     //   4  // passed as a 4-component uint8 attribute  [7] - weights should add up to 1.0
    // ======================  Total //  52  bytes of data per vertex packed in a single buffer
  }

  equal(other) {
    return (
      this.position.equal(other.position)
      && this.normal.equal(other.normal)
      && this.tangent.equal(other.tangent)
      && this.color.equal(other.color)
      && this.texCoord.equal(other.texCoord)
      && this.texCoordAlt.equal(other.texCoordAlt)
      && this.bones.every( (val, i) => other.bones[i] === val )
      && this.weights.every( (val, i) => other.weights[i] === val )
    );
  }
}

class Polygon {
  constructor(
    indices = [],
    normal  = null,
    tangent = null
  ) {
    this.indices = indices;
    this.normal  = normal;
    this.tangent = tangent;
  }
}

class Mesh {
  constructor(meshType) {
    if(meshType !== Mesh.Type.Static && meshType !== Mesh.Type.Dynamic && meshType !== Mesh.Type.Stream) {
      throw new Error("Mesh.constructor argument meshType must be something of [Mesh.Type.Static, Mesh.Type.Dynamic, Mesh.Type.Stream]");
    }

    this.armature = true;

    if(meshType === meshType.Static) {
      this.armature = false;
    }

    this.meshType = meshType;
    this.data = new DataBuffer(meshType);
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
          v0 = this.vertices[p.indices[1]].position.sub(this.vertices[p.indices[0]].position);
          v1 = this.vertices[p.indices[2]].position.sub(this.vertices[p.indices[0]].position);
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
      
      this.polygons[i].tangent = accum.normalize();
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
      arrayBuffer   = null,
      normals       = this.vertices.every(v => !!v.normal),
      tangents      = this.vertices.every(v => !!v.tangent),
      colors        = this.vertices.every(v => !!v.color),
      texCoords     = this.vertices.every(v => !!v.texCoord),
      texCoordsAlt  = this.vertices.every(v => !!v.texCoordAlt),
      bones         = this.armature && this.vertices.every(v => v.bones.length === 4 && v.bones.every( b => b !== -1)),
      weights       = this.armature && this.vertices.every(v => v.weights.length === 4 && v.weights.every( w => w !== -1)),
      armature      = this.armature && bones && weights,

      bytesPerVertex = 16; // position is the only required attribute

    // determine total byte buffer length
    normals      && (bytesPerVertex += 4);
    tangents     && (bytesPerVertex += 4);
    colors       && (bytesPerVertex += 4);
    texCoords    && (bytesPerVertex += 8);
    texCoordsAlt && (bytesPerVertex += 8);
    armature     && (bytesPerVertex += 8);


    arrayBuffer = new ArrayBuffer(bytesPerVertex * this.vertices.length);

    let
      float32View = new Float32Array(arrayBuffer),
      uint16View  = new Uint16Array(arrayBuffer),
      uint8View   = new Uint8Array(arrayBuffer),
      bufferOffset;

    this.vertices.forEach( (v, i) => {
      bufferOffset = 0;

      // store positions as floats to arrayBuffer
      float32View[i * (bytesPerVertex / 4) + (bufferOffset / 4) + 0] = v.position.x;
      float32View[i * (bytesPerVertex / 4) + (bufferOffset / 4) + 1] = v.position.y;
      float32View[i * (bytesPerVertex / 4) + (bufferOffset / 4) + 2] = v.position.z || 0.0;
      float32View[i * (bytesPerVertex / 4) + (bufferOffset / 4) + 3] = v.position.w || 1.0;
      bufferOffset += 16;

      // store normals as normalized uint8 components
      if(normals) {
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 0] = (v.normal.x * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 1] = (v.normal.y * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 2] = (v.normal.z * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 3] = 255;
        bufferOffset += 4;
      }

      // store tangents as normalized uint8 components
      if(tangents) {
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 0] = (v.tangent.x * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 1] = (v.tangent.y * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 2] = (v.tangent.z * 0.5 + 0.5) * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 3] = 255;
        bufferOffset += 4;
      }

      // store colors as uint8 components
      if(colors) {
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 0] = v.color.x * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 1] = v.color.y * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 2] = v.color.z * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 3] = v.color.w * 255;
        bufferOffset += 4;
      }

      // store texCoord as normalized uint16 components
      if(texCoords) {
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 0] = v.texCoord.x * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 1] = v.texCoord.y * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 2] = v.texCoord.z * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 3] = v.texCoord.w * 65535;
        bufferOffset += 8;
      }

      // store texCoordAlt as normalized uint16 components
      if(texCoordsAlt) {
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 0] = v.texCoordAlt.x * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 1] = v.texCoordAlt.y * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 2] = v.texCoordAlt.z * 65535;
        uint16View[i * (bytesPerVertex / 2) + (bufferOffset / 2) + 3] = v.texCoordAlt.w * 65535;
        bufferOffset += 8;
      }

      // store bone indices as uint8 components
      // store bone weights as normalized uint8 components
      if(armature && bones && weights) {
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 0] = v.bones.x;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 1] = v.bones.y;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 2] = v.bones.z;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 3] = v.bones.w;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 4] = v.weights.x * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 5] = v.weights.y * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 6] = v.weights.z * 255;
        uint8View[i * (bytesPerVertex / 1) + (bufferOffset / 1) + 7] = v.weights.w * 255;
      }
    });

    this.data.bind();
    this.data.data(arrayBuffer);
    bufferOffset = 0;
    this.data.pointer(0, 4, Buffer.DataType.Float, false, bytesPerVertex, bufferOffset);
    bufferOffset += 16;

    if(normals) {
      this.data.pointer(1, 4, Buffer.DataType.UnsignedByte, true, bytesPerVertex, bufferOffset);
      bufferOffset += 4 ;
    }

    if(tangents) {
      this.data.pointer(2, 4, Buffer.DataType.UnsignedByte, true, bytesPerVertex, bufferOffset);
      bufferOffset += 4;
    }
    
    if(colors) {
      this.data.pointer(3, 4, Buffer.DataType.UnsignedByte, true, bytesPerVertex, bufferOffset);
      bufferOffset += 4;
    }

    if(texCoords) {
      this.data.pointer(4, 4, Buffer.DataType.UnsignedShort, true, bytesPerVertex, bufferOffset);
      bufferOffset += 16;
    }

    if(texCoordsAlt) {
      this.data.pointer(5, 4, Buffer.DataType.UnsignedShort, true, bytesPerVertex, bufferOffset);
      bufferOffset += 16;  
    }
    
    if(armature && bones && weights) {
      this.data.pointer(6, 4, Buffer.DataType.UnsignedByte, false, bytesPerVertex, bufferOffset);
      bufferOffset += 4;
      this.data.pointer(7, 4, Buffer.DataType.UnsignedByte, true, bytesPerVertex, bufferOffset);
    }

    this.data.unbind();

    this.indices.bind();
    this.indices.data(
      this.polygons.reduce( (memo, p) => {
        memo.push(...p.indices);
        return memo;
      }, [])
    );
    this.indices.unbind();
  }

  draw() {
    this.data.bind();
    this.indices.bind();

    this.indices.draw(Buffer.DrawMethod.Triangles, this.polygons.length * 3, 0);

    this.indices.unbind();
    this.data.unbind();
  }

  delete() {
    this.dataFp32.delete();
    this.dataUint16.delete();
    this.dataUint8.delete();
    this.indices.delete();
  }
}

Mesh.Type = {
  Static:   Buffer.Type.Static.Draw,
  Dynamic:  Buffer.Type.Dynamic.Draw,
  Stream:   Buffer.Type.Stream.Draw
};

Mesh.Vertex = Vertex;
Mesh.Polygon = Polygon;

export default Mesh;
