class Color {
  constructor(r = 1.0, g = 1.0, b = 1.0, a = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b; 
    this.a = a;
  }

  toHSV() {
    throw new Error("Color.toHSV not implemented");
  }

  fromHSV(color) {
    throw new Error("Color.fromHSV not implemented"); 
  }
}

export default Color;
