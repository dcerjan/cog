precision highp float;

varying vec4 fTexCoord;

uniform sampler2D fTexChannel0;

void main(void) {
  vec4 color = texture2D(fTexChannel0, fTexCoord.xy);

  vec2 n = color.xy * 2.0 - 1.0;
  float z = sqrt(1.0 - n.x*n.x - n.y*n.y);

  vec3 N = (vec3(n, z));
  gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);
}
