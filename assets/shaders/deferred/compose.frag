precision highp float;

varying vec4 fTexCoord;

uniform sampler2D   fPosition;
uniform sampler2D   fDepth;
uniform sampler2D   fNormal;
uniform sampler2D   fDiffuse;
uniform sampler2D   fSpecular;
//uniform sampler2D   fBloom;
//uniform samplerCube fEnvironment;


const vec3 light        = vec3(-1.0, 1.0, 1.0);
const vec3 attenuation  = vec3(0.0, 0.008, 0.03);
const vec4 color        = vec4(1.0);


void main() {
  vec4  sPosition     = texture2D(fPosition, fTexCoord.xy);
  float sDepth        = texture2D(fDepth, fTexCoord.xy).x;
  vec4  sNormal       = texture2D(fNormal, fTexCoord.xy);
  vec4  sDiffuse      = texture2D(fDiffuse, fTexCoord.xy);
  vec4  sSpecular     = texture2D(fSpecular, fTexCoord.xy);
  //vec4  sBloom        = texture2D(fBloom, fTexCoord.xy);
  //vec4  sEnvironment  = textureCube(fEnvironment, fTexCoord.xy);

  vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

  float x = sNormal.x * 2.0 - 1.0;
  float y = sNormal.y * 2.0 - 1.0;
  float z = sqrt(1.0 - x*x - y*y);
  vec3 normal = vec3(x, y, z);
        
  vec3 lightDir = sPosition.xyz - light;
  float distance = length(lightDir);
  lightDir = -normalize(lightDir);
  float diffuseFactor = dot(lightDir, normal);
  float att = 1.0 / (attenuation.x + attenuation.y * distance + attenuation.z * distance * distance);
  
  if(diffuseFactor > 0.0) {
    col += vec4(color.rgb * sDiffuse.a * diffuseFactor, 1.0);
    vec3 vertToEye = -normalize(sPosition.xyz);
    vec3 lightReflect = normalize(reflect(-lightDir, normal));
    float specularFactor = dot(vertToEye, lightReflect);
    specularFactor = pow(specularFactor, sSpecular.a * 256.0);
    if(specularFactor > 0.0) {
      col += vec4( (sNormal.a * 2.0 - 1.0) * specularFactor * sSpecular.rgb, 1.0);
    }
  }
  
  gl_FragColor = vec4(att * col.rgb * sDiffuse.rgb, 1.0);
}
