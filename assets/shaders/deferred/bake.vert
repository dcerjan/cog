precision highp float;

attribute vec4 vPosition;
attribute vec4 vNormal;
attribute vec4 vTangent;
attribute vec4 vColor;
attribute vec4 vTexCoord;
attribute vec4 vTexCoordAlt;
attribute vec4 vBoneIndex;
attribute vec4 vBoneWeight;

// varyings
varying vec4 fPosition;
varying vec4 fNormal;
varying vec4 fTangent;
varying vec4 fColor;
varying vec4 fTexCoord;
varying vec4 fTexCoordAlt;

uniform mat4 uModelView;
uniform mat4 uProjection;
// uniform mat4 uBoneMatrix[240];

void main() {
  fPosition     = uModelView * vPosition;
  fNormal       = uModelView * vec4(vNormal.xyz * 2.0 - 1.0, 0.0);
  fTangent      = uModelView * vec4(vTangent.xyz * 2.0 - 1.0, 0.0);
  fColor        = vColor;
  fTexCoord     = vTexCoord;
  fTexCoordAlt  = vTexCoordAlt;

  // TODO: 
  //   GPU Skinning

  // NOTE: 
  // Depth is written to a depth component 16 texture automaticly
  //

  gl_Position   = uProjection * fPosition;
}