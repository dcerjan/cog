precision highp float;
#extension GL_EXT_draw_buffers : require

varying lowp vec4 fTexCoord;
varying lowp vec4 fTexCoordAlt;

void main(void) {
  gl_FragData[0] = vec4(fTexCoord.rgb, 1.0);
}
