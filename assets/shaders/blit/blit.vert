precision highp float;

attribute vec2 pos;
attribute vec4 color;

varying lowp vec4 fColor;

void main() {
  fColor = color;
  gl_Position = vec4(pos, 0.0, 1.0);
}
