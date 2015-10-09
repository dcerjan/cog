import Mesh from "./mesh";
import Vector3 from "../../math/vector3";
import Vector4 from "../../math/vector4";

let box = (width, height, depth, insideNormals = false) => {
  let mesh = new Mesh(Mesh.Type.Static);

  let 
    x = 0.5 * width,
    y = 0.5 * height,
    z = 0.5 * depth;

  mesh.vertices.push(
    new Mesh.Vertex(new Vector3(-x, -y, -z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x, -y, -z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y, -z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3(-x,  y, -z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0)),

    new Mesh.Vertex(new Vector3(-x, -y,  z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x, -y,  z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y,  z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3(-x,  y,  z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0)),

    new Mesh.Vertex(new Vector3( x, -y, -z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y, -z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y,  z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3( x, -y,  z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0)),

    new Mesh.Vertex(new Vector3(-x, -y, -z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3(-x,  y, -z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3(-x,  y,  z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3(-x, -y,  z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0)),

    new Mesh.Vertex(new Vector3(-x,  y, -z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y, -z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x,  y,  z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3(-x,  y,  z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0)),
    
    new Mesh.Vertex(new Vector3(-x, -y, -z), null, null, new Vector4(1, 0, 0, 1), new Vector4(0, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x, -y, -z), null, null, new Vector4(0, 1, 0, 1), new Vector4(1, 0, 0, 0)),
    new Mesh.Vertex(new Vector3( x, -y,  z), null, null, new Vector4(0, 0, 0, 1), new Vector4(1, 1, 0, 0)),
    new Mesh.Vertex(new Vector3(-x, -y,  z), null, null, new Vector4(1, 1, 1, 1), new Vector4(0, 1, 0, 0))
  );

  mesh.polygons.push(
    new Mesh.Polygon([ 0, 1, 2]), new Mesh.Polygon([ 0, 2, 3]),
    new Mesh.Polygon([ 6, 5, 4]), new Mesh.Polygon([ 7, 6, 4]),
    new Mesh.Polygon([10, 9, 8]), new Mesh.Polygon([11,10, 8]),
    new Mesh.Polygon([12,13,14]), new Mesh.Polygon([12,14,15]),
    new Mesh.Polygon([16,17,18]), new Mesh.Polygon([16,18,19]),
    new Mesh.Polygon([22,21,20]), new Mesh.Polygon([23,22,20])
  );

  if(insideNormals) {
    mesh.polygons.forEach((p) => {
      let tmp = p.indices[0];
      p.indices[0] = p.indices[2];
      p.indices[2] = tmp;
    });  
  }

  mesh.calcNormals();
  mesh.calcTangents();

  mesh.compile();

  return mesh;
};

export default box;