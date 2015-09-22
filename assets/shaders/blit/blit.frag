precision highp float;

varying lowp vec4 fColor;

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * fColor;
}
