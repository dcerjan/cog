import clamp from "./util";

class Vector2 {
  constructor(x, y) {
    this.x = x || 0.0;
    this.y = y || 0.0;
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(s) {
    return new Vector2(this.x*s, this.y*s);
  }

  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  distanceTo(other) {
    let
      x = other.x - this.x,
      y = other.y - this.y;
    return Math.sqrt(x*x + y*y);
  }

  normalize() {
    let l = this.length();
    return new Vector2(this.x/l, this.y/l);
  }

  lerp(dest, t) {
    t = clamp(t, 0.0, 1.0);
    let
      oneminust = 1.0 - t,
      x = this.x * oneminust + dest.x * t,
      y = this.y * oneminust + dest.y * t;

    return new Vector2(x, y);
  }

  dot(other) {
    return this.x*other.x + this.y*other.y;
  }

  cross() {
    return new Vector2(y, -x);
  }

  equal(other) {
    return (
      this.x === other.x
      && this.y === other.y
    );
  }
}

Vector2.Lerp = (src, dst, t) => src.lerp(dst, t);

export default Vector2;
