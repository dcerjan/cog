precision highp float;

attribute vec4 vPosition;
attribute vec4 vNormal;
attribute vec4 vTangent;
attribute vec4 vColor;
attribute vec4 vTexCoord;
attribute vec4 vTexCoordAlt;
attribute vec4 vBoneIndex;
attribute vec4 vBoneWeight;

varying lowp vec4 fTexCoord;
varying lowp vec4 fTexCoordAlt;

void main() {
  fTexCoord = vTexCoord;
  fTexCoordAlt = vTexCoordAlt;
  gl_Position = vec4(vPosition.xy, 0.0, 1.0);
}
