precision highp float;

varying lowp vec4 fTexCoord;
varying lowp vec4 fTexCoordAlt;

void main(void) {
  gl_FragColor = vec4(fTexCoord.rgb, 1.0);
}
