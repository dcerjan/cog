import Vector2 from "./vector2";

class Matrix2 {
  constructor(a00 = 1.0, a01 = 0.0, a10 = 0.0, a11 = 1.0) {
    this.m = [
      a00, a01, 
      a10, a11
    ];
  }

  transpose() {
    return new Matrix2(this.m[0], this.m[2], this.m[1], this.m[3]);
  }

  inverse() {
    throw new Error("Matrix2.inverse not implemented");
    return new Matrix2();
  }

  mul(other) {
    return new Matrix2(
      this.m[0]*other.m[0] + this.m[2]*other.m[1], 
      this.m[1]*other.m[0] + this.m[3]*other.m[1],
      
      this.m[0]*other.m[2] + this.m[2]*other.m[3], 
      this.m[1]*other.m[2] + this.m[3]*other.m[3]
    );
  }

  rotation(angle) {
    let
      cosa = Math.cos(angle),
      sina = Math.sin(angle);

    return new Matrix2(
      cosa, -sina, 
      sina, cosa
    );
  }

  transform(vector) {
    return new Vector2(
      this.m[0]*vector.x + this.m[2]*vector.y,
      this.m[1]*vector.x + this.m[3]*vector.y
    );
  }
}

Matrix2.Identity = () => { return new Matrix2(); };
Matrix2.Rotation = Matrix2.prototype.rotation;

export default Matrix2;
