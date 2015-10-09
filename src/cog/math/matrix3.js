import Vector2 from "./vector2";
import Vector3 from "./vector3";

class Matrix3 {
  constructor(
    /*0*/a00 = 1.0, /*1*/a01 = 0.0, /*2*/a02 = 0.0,
    /*3*/a10 = 0.0, /*4*/a11 = 1.0, /*5*/a12 = 0.0,
    /*6*/a20 = 0.0, /*7*/a21 = 0.0, /*8*/a22 = 1.0
  ) {
    this.m = [
      a00, a01, a02,
      a10, a11, a12,
      a20, a21, a22
    ];
  }

  transpose() {
    return new Matrix3(
      this.m[0], this.m[3], this.m[6],
      this.m[1], this.m[4], this.m[7],
      this.m[2], this.m[5], this.m[8]
    );
  }

  inverse() {
    let
      d00 = this.m[4] * this.m[8] - this.m[5] * this.m[7],
      d01 = this.m[3] * this.m[8] - this.m[5] * this.m[6],
      d02 = this.m[3] * this.m[7] - this.m[4] * this.m[6],
    
      d10 = this.m[1] * this.m[8] - this.m[2] * this.m[7],
      d11 = this.m[0] * this.m[8] - this.m[2] * this.m[6],
      d12 = this.m[0] * this.m[7] - this.m[1] * this.m[6],
    
      d20 = this.m[1] * this.m[5] - this.m[2] * this.m[4],
      d21 = this.m[0] * this.m[5] - this.m[2] * this.m[6],
      d22 = this.m[0] * this.m[4] - this.m[1] * this.m[3],
    
      d = 1.0 / (this.m[0] * d00 + this.m[1] * d01 + this.m[2] * d02);
    
    return new Matrix3(
      +d00 * d, -d10 * d, +d20 * d,
      -d01 * d, +d11 * d, -d21 * d,
      +d02 * d, -d12 * d, +d22 * d
    );
  }

  mul(other) {
    return new Matrix3(
      this.m[0]*other.m[0] + this.m[3]*other.m[1] + this.m[6]*other.m[2],
      this.m[1]*other.m[0] + this.m[4]*other.m[1] + this.m[7]*other.m[2],
      this.m[2]*other.m[0] + this.m[5]*other.m[1] + this.m[8]*other.m[2],

      this.m[0]*other.m[3] + this.m[3]*other.m[4] + this.m[6]*other.m[5],
      this.m[1]*other.m[3] + this.m[4]*other.m[4] + this.m[7]*other.m[5],
      this.m[2]*other.m[3] + this.m[5]*other.m[4] + this.m[8]*other.m[5],

      this.m[0]*other.m[6] + this.m[3]*other.m[7] + this.m[6]*other.m[8],
      this.m[1]*other.m[6] + this.m[4]*other.m[7] + this.m[7]*other.m[8],
      this.m[2]*other.m[6] + this.m[5]*other.m[7] + this.m[8]*other.m[8]
    );
  }

  rotation2D(angle) {
    let
      cosa = Math.cos(angle),
      sina = Math.sin(angle);

    return new Matrix2(
      cosa, -sina,  0.0,
      sina,  cosa,  0.0,
      0.0,    0.0,  1.0
    );
  }

  translation2D(vector) {
    return new Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      vector.x, vector.y, 1.0
    );
  }

  scale2D(s, t) {
    return new Matrix3(
      s,   0.0, 0.0, 
      0.0,   t, 0.0,
      0.0, 0.0, 1.0
    );
  }

  transform2D(vector) {
    return new Vector2(
      this.m[0]*vector.x + this.m[3]*vector.y + this.m[6],
      this.m[1]*vector.x + this.m[4]*vector.y + this.m[7]
    );
  }

  rotation3D(axis, angle) {
    let
      c = Math.cos(angle),
      s = Math.sin(angle),
      onec = 1.0 - c,
      u = axis.x,
      v = axis.y,
      w = axis.z;

    return new Matrix3(
      u*u + (1.0 - u*u)*c,  u*v * onec - w*s,      u*w * onec + v*s,
      u*v * onec + w*s,     v*v + (1.0 - v*v)*c,   v*w * onec - u*s,
      u*w * onec - v*s,     v*w * onec + u*s,      w*w + (1.0 - w*w)*c
    );
  }

  scale3D(s, t, u) {
    return new Matrix3(
      s,   0.0, 0.0, 
      0.0,   t, 0.0,
      0.0, 0.0,   u
    );
  }

  transform3D(vector) {
    return new Vector3(
      this.m[0]*vector.x + this.m[3]*vector.y + this.m[6]*vector.z,
      this.m[1]*vector.x + this.m[4]*vector.y + this.m[7]*vector.z,
      this.m[2]*vector.x + this.m[5]*vector.y + this.m[8]*vector.z
    );
  }
}

Matrix3.Identity = () => { return new Matrix3(); };

Matrix3.Rotation2D = Matrix3.prototype.rotation2D;
Matrix3.Translation2D = Matrix3.prototype.translation2D;
Matrix3.Scale2D = Matrix3.prototype.scale2D;

Matrix3.Rotation3D = Matrix3.prototype.rotation3D;
Matrix3.Scale3D = Matrix3.prototype.scale3D;


export default Matrix3;
