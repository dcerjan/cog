import Mesh from "./mesh";
import Vector3 from "../../math/vector3";
import Vector4 from "../../math/vector4";
import MathUtil from "../../math/util";


let vec3fromSpherical = (r, t, p) => {
  let c = MathUtil.sphericalToCartesian(r, t, p);
  return new Vector3(c[0], c[1], c[2]);
};

let sphere = (radius, stacks, slices, insideNormals = false) => {
  let mesh = new Mesh(Mesh.Type.Static);

  let
    i, j,
    v, h, r;

  r = radius;
  v = stacks > 1 ? stacks : 2;
  h = slices > 2 ? slices : 3;

  // spherical uv coordinates
  let
    // tu = (n) => (Math.asin(n.x) / Math.PI + 0.5),
    // tv = (n) => (Math.asin(n.y) / Math.PI + 0.5);
    tu = (n) => n.x/2 + 0.5,
    tv = (n) => n.y/2 + 0.5;

  // elevation [0,90] deg
  for(i = 0; i < v; ++i) {
    let
      theta0 = i / v * Math.PI,
      theta1 = (i + 1) / v * Math.PI;

    // azimuth [0,180] deg
    for(j = 0; j < h; ++j) {

      let
        phi0 = j / h * 2.0 * Math.PI,
        phi1 = (j + 1) / h * 2.0 * Math.PI; 


      let
        n0 = vec3fromSpherical(1.0, theta0, phi0),
        n1 = vec3fromSpherical(1.0, theta0, phi1),
        n2 = vec3fromSpherical(1.0, theta1, phi1),
        n3 = vec3fromSpherical(1.0, theta1, phi0),
        v0 = new Mesh.Vertex(vec3fromSpherical(r, theta0, phi0), insideNormals ? n0.complement() : n0, null, null, new Vector4(tu(n0), tv(n0), tu(n0), tv(n0))),
        v1 = new Mesh.Vertex(vec3fromSpherical(r, theta0, phi1), insideNormals ? n1.complement() : n1, null, null, new Vector4(tu(n1), tv(n1), tu(n1), tv(n1))),
        v2 = new Mesh.Vertex(vec3fromSpherical(r, theta1, phi1), insideNormals ? n2.complement() : n2, null, null, new Vector4(tu(n2), tv(n2), tu(n2), tv(n2))),
        v3 = new Mesh.Vertex(vec3fromSpherical(r, theta1, phi0), insideNormals ? n3.complement() : n3, null, null, new Vector4(tu(n3), tv(n3), tu(n3), tv(n3)));

      if(i === 0) {
        mesh.vertices.push(v0, v2, v3);
        mesh.polygons.push(
          new Mesh.Polygon(
            [mesh.vertices.length - 3, mesh.vertices.length - 2, mesh.vertices.length - 1], 
            v0.normal.add(v1.normal.add(v2.normal)).normalize()
          )
        );
      } else if(i + 1 === v) {
        mesh.vertices.push(v2, v0, v1);
        mesh.polygons.push(
          new Mesh.Polygon(
            [mesh.vertices.length - 3, mesh.vertices.length - 2, mesh.vertices.length - 1],
            v0.normal.add(v1.normal.add(v2.normal)).normalize()
          )
        );
      } else {
        mesh.vertices.push(v0, v1, v3);
        mesh.polygons.push(
          new Mesh.Polygon(
            [mesh.vertices.length - 3, mesh.vertices.length - 2, mesh.vertices.length - 1],
            v0.normal.add(v1.normal.add(v2.normal)).normalize()
          )
        );
        mesh.vertices.push(v1, v2, v3);
        mesh.polygons.push(
          new Mesh.Polygon(
            [mesh.vertices.length - 3, mesh.vertices.length - 2, mesh.vertices.length - 1],
            v0.normal.add(v1.normal.add(v2.normal)).normalize()
          )
        );
      } 
    }
  }

  if(insideNormals) {
    mesh.polygons.forEach((p) => {
      let tmp = p.indices[0];
      p.indices[0] = p.indices[2];
      p.indices[2] = tmp;
    });  
  }
  
  //mesh.calcNormals();
  mesh.calcTangents();

  mesh.compile();

  return mesh;
};

export default sphere;