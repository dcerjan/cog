precision highp float;

varying vec4 fTexCoord;

uniform sampler2D fTexChannel0;

void main(void) {
  vec4 color = texture2D(fTexChannel0, fTexCoord.xy);
  gl_FragColor = vec4(color.rgb, 1.0);
}
