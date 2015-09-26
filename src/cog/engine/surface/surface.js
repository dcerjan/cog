import Mesh from "../mesh/mesh";
import Vector2 from "../../math/vector2";
import Vector4 from "../../math/vector4";

class Surface {

  constructor(xpos = 0.0, ypos = 0.0, width = 1.0, height = 1.0) {
    this.rect = {
      x: xpos,
      y: ypos,
      w: width,
      h: height
    };
    
    this.mesh = new Mesh(Mesh.Type.Static);

    this.mesh.vertices.push(
      new Mesh.Vertex(
        new Vector2(-1.0 + 2.0 * this.rect.x, 1.0 - 2.0 * this.rect.y), 
        null, null, null, new Vector4(0.0, 0.0, 0.0, 0.0)
      ),
      
      new Mesh.Vertex(
        new Vector2(-1.0 + 2.0 * (this.rect.x + this.rect.w), 1.0 - 2.0 * this.rect.y), 
        null, null, null, new Vector4(1.0, 0.0, 1.0, 0.0)
      ),
      
      new Mesh.Vertex(
        new Vector2(-1.0 + 2.0 * (this.rect.x + this.rect.w), 1.0 - 2.0 * (this.rect.y + this.rect.h)), 
        null, null, null, new Vector4(1.0, 1.0, 1.0, 1.0)
      ),
      
      new Mesh.Vertex(
        new Vector2(-1.0 + 2.0 * this.rect.x, 1.0 - 2.0 * (this.rect.y + this.rect.h)),
        null, null, null, new Vector4(0.0, 1.0, 0.0, 1.0)
      )
    );

    this.mesh.polygons.push(
      new Mesh.Polygon([0, 1, 2]),
      new Mesh.Polygon([0, 2, 3])
    );

    this.mesh.compile();
  }

  blit() {
    this.mesh.draw();
  }

  clear() {
    this.mesh.clear();
  }
}

export default Surface;
