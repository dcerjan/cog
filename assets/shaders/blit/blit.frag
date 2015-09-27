precision highp float;

varying lowp vec4 fTexCoord;
varying lowp vec4 fTexCoordAlt;

uniform sampler2D fTexChannel0;

void main(void) {
  vec4 color = texture2D(fTexChannel0, fTexCoord.xy);

  gl_FragColor = vec4(color.xyz, 1.0);
}
