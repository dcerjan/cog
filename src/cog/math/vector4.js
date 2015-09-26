import clamp from "./util";

class Vector4 {
  constructor(x, y, z, w) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
    this.w = w || 0.0;
  }

  add(other) {
    return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
  }

  sub(other) {
    return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
  }

  scale(s) {
    return new Vector4(this.x*s, this.y*s, this.z*s, this.w*s);
  }

  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z, this.w*this.w);
  }

  distanceTo(other) {
    let
      x = other.x - this.x,
      y = other.y - this.y,
      z = other.z - this.z,
      w = other.w - this.w;
    return Math.sqrt(x*x + y*y + z*z, w*w);
  }

  normalize() {
    let l = this.length();
    return new Vector4(this.x/l, this.y/l, this.z/l, this.w/l);
  }

  lerp(dest, t) {
    t = clamp(t, 0.0, 1.0);
    let
      oneminust = 1.0 - t,
      x = this.x * oneminust + dest.x * t,
      y = this.y * oneminust + dest.y * t,
      z = this.z * oneminust + dest.z * t,
      w = this.w * oneminust + dest.w * t;

    return new Vector4(x, y, z, w);
  }

  dot(other) {
    return this.x*other.x + this.y*other.y + this.z*other.z + this.w*other.w;
  }

  equal(other) {
    return (
      this.x === other.x
      && this.y === other.y
      && this.z === other.z
      && this.w === other.w
    );
  }
}

Vector4.Lerp = (src, dst, t) => src.lerp(dst, t);

export default Vector4;
