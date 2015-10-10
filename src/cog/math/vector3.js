import clamp from "./util";

class Vector3 {
  constructor(x, y, z) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
  }

  add(other) {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other) {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(s) {
    return new Vector3(this.x*s, this.y*s, this.z*s);
  }

  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  }

  distanceTo(other) {
    let
      x = other.x - this.x,
      y = other.y - this.y,
      z = other.z - this.z;
    return Math.sqrt(x*x + y*y + z*z);
  }

  normalize() {
    let l = this.length();
    return new Vector3(this.x/l, this.y/l, this.z/l);
  }

  lerp(dest, t) {
    t = clamp(t, 0.0, 1.0);
    let
      oneminust = 1.0 - t,
      x = this.x * oneminust + dest.x * t,
      y = this.y * oneminust + dest.y * t,
      z = this.z * oneminust + dest.z * t;

    return new Vector3(x, y, z);
  }

  dot(other) {
    return this.x*other.x + this.y*other.y + this.z*other.z;
  }

  cross(other) {
    return new Vector3(
      this.y*other.z - this.z*other.y,
      this.z*other.x - this.x*other.z,
      this.x*other.y - this.y*other.x
    );
  }

  equal(other) {
    return (
      this.x === other.x
      && this.y === other.y
      && this.z === other.z
    );
  }
}

const _zero = new Vector3();
const _x = new Vector3(1,0,0);
const _y = new Vector3(0,1,0);
const _z = new Vector3(0,0,1);

Vector3.Lerp = (src, dst, t) => src.lerp(dst, t);
Vector3.Zero = _zero;
Vector3.X = _x;
Vector3.Y = _y;
Vector3.Z = _z;

export default Vector3;
