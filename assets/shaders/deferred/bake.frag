#extension GL_EXT_draw_buffers : require
precision highp float;

// ========================= //
// =  Material definition  = //
// ========================= //
  
  // Vectors
    uniform vec4        uAmbientColor;
    uniform vec4        uDiffuseColor;
    uniform vec4        uSpecularColor;
    uniform vec4        uEnvironmentColor;
    uniform vec4        uDetailColor;
    uniform vec4        uGlowColor;

  // Floats - Packed to 'uniform vec4 uFloatChannel[2]'
    uniform vec4        uFloatChannel[2];

  // Material flags
    uniform ivec4       uIntChannel[2];

  // Samplers
    uniform sampler2D   uAmbientOcclusionMap;
    uniform sampler2D   uDiffuseMap;
    uniform sampler2D   uSpecularMap;
    uniform sampler2D   uNormalMap;
    uniform sampler2D   uHeightMap;
    uniform sampler2D   uDetailMap;
    uniform sampler2D   uGlowMap;
    uniform samplerCube uEnvironemntMap;


  // Floats helpers
    #define uAmbientOcclusionIntensity  uFloatChannel[0].x
    #define uDiffuseIntensity           uFloatChannel[0].y
    #define uSpecularIntensity          uFloatChannel[0].z
    #define uSpecularHardness           uFloatChannel[0].w
    #define uHeightScale                uFloatChannel[1].x
    #define uEnvironmentIntensity       uFloatChannel[1].y
    #define uDetailIntensity            uFloatChannel[1].z
    #define uGlowIntensity              uFloatChannel[1].w

  // Flags helpers    
    #define mHasAmbientOcclusionMap     uIntChannel[0].x
    #define mHasDiffuseMap              uIntChannel[0].y
    #define mHasSpecularMap             uIntChannel[0].z
    #define mHasNormalMap               uIntChannel[0].w
    #define mHasHeightMap               uIntChannel[1].x
    #define mHasEnvironmentMap          uIntChannel[1].y
    #define mHasDetailMap               uIntChannel[1].z
    #define mHasGlowMap                 uIntChannel[1].w

// =========================== //
// =  Vertex Shader Outputs  = //
// =========================== //
  varying vec4 fPosition;
  varying vec4 fNormal;
  varying vec4 fTangent;
  varying vec4 fColor;
  varying vec4 fTexCoord;
  varying vec4 fTexCoordAlt;

// ======================= //
// =  Utility Functions  = //
// ======================= //
  float overlayf(float a, float b) {
    if(a < 0.5) {
      return (2.0 * a * b);
    } else {
      return (1.0 - 2.0 * (1.0 -a ) * (1.0 - b));
    }
  }

  vec4 overlay(vec4 a, vec4 b) {
    return vec4(
      overlayf(a.x,b.x),
      overlayf(a.y,b.y),
      overlayf(a.z,b.z),
      overlayf(a.w,b.w)
    );
  }



// TODO: 
// try moving tangent ortogonalization to vertex shader
// without noticable loss of precision 
// - potentially avoid calculating T = normalize(T - dot(N, T) * N);
// per pixel

// TODO:
// see where to fit tangent map or calculate displacement 
// per pixel in this shader before writing pixel data to 
// gl_FragData[i]; // i > 0

void main(void) {

  // Calculate the TBN matrix
  // needed for normal & parallax displacement mapping
  vec3 N = normalize(fNormal.xyz);
  vec3 T = normalize(fTangent.xyz);
  T = normalize(T - dot(N, T) * N);
  vec3 B = cross(N, T);
  mat3 TBN = mat3(T, B, N);

  gl_FragData[0] = fPosition;
  
  // ========================================== //
  // =  Normal + Height + Specular Intensity  = //
  // ========================================== //
    float height = 0.0;
    if(mHasHeightMap == 1) {
      height = texture2D(uHeightMap, fTexCoord.xy).x * uHeightScale;
    }

    if(mHasNormalMap == 1) {
      N = TBN * (2.0 * texture2D(uNormalMap, fTexCoord.xy) - 1.0).xyz;
      gl_FragData[1] = vec4(0.5 + 0.5 * N.xy, height, uSpecularIntensity);
    } else {
      gl_FragData[1] = vec4(0.5 + 0.5 * N.xy, height, uSpecularIntensity);
    }
  
  // ============================================================== //
  // =  Diffuse + Detail + Ambient Occlusion + Diffuse Intensity  = //
  // ============================================================== //
    vec4 detail = vec4(0.5); // neutral factor for overlay blending
    float ao = 1.0; // neutral factor for ambient occlusion multiplication

    if(mHasDetailMap == 1) {
      detail = texture2D(uDetailMap, fTexCoord.xy) * uDetailColor * uDetailIntensity;
    }

    if(mHasAmbientOcclusionMap == 1) {
      ao = texture2D(uAmbientOcclusionMap, fTexCoord.xy).r * uAmbientOcclusionIntensity;
    }

    if(mHasDiffuseMap == 1) {
      gl_FragData[2] = uAmbientColor + vec4( overlay(texture2D(uDiffuseMap, fTexCoord.xy) * uDiffuseColor, detail).rgb, uDiffuseIntensity) * ao;
    } else {
      gl_FragData[2] = uAmbientColor + vec4( overlay(uDiffuseColor, detail).rgb, uDiffuseIntensity) * ao;
    }

  // ================================== //
  // =  Specular + Specular Hardness  = //
  // ================================== //
    if(mHasSpecularMap == 1) {
      gl_FragData[3] = vec4(texture2D(uSpecularMap, fTexCoord.xy).rgb * uSpecularColor.rgb, uSpecularHardness);
    } else {
      gl_FragData[3] = vec4(uSpecularColor.rgb, uSpecularHardness);
    }

  // =========================== //
  // =  Glow + Glow Intensity  = //
  // =========================== //
    if(mHasGlowMap == 1) {
      gl_FragData[4] = vec4(texture2D(uGlowMap, fTexCoord.xy).rgb * uGlowColor.rgb, uGlowIntensity);
    } else {
      gl_FragData[4] = vec4(0.0);
    }

  // ========================================= //
  // =  Environment + Environment Intensity  = //
  // ========================================= //
    if(mHasEnvironmentMap == 1) {
      gl_FragData[5] = vec4(1.0); //vec4( (textureCube(uEnvironemntMap, N)).rgb, uEnvironmentIntensity);
    } else {
      gl_FragData[5] = vec4(0.0);
    }

}