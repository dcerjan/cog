import Vector4 from "../../math/vector4";
//import Renderer from "../renderer/renderer";

class Material {
  constructor(name) {
    this.name = name;

    this.castShadow = true;

    this.ambient = {
      color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: 0.0,
      occlusion: {
        map: null,
        intensity: 0.0
      }
    };

    this.diffuse = {
      color: new Vector4(0.25, 0.25, 0.25, 1.0),
      intensity: 1.0,
      map: null
    };

    this.specular = {
      color: new Vector4(0.2, 0.4, 0.7, 1.0),
      intensity: 1.0,
      hardness: 1,
      map: null
    };

    this.bump = {
      normal: {
        map: null
      },
      height: {
        map: null,
        scale: 1.0
      }
    };

    this.environment = {
      color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: 0.0,
      map: null
    };

    this.detail = {
      color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: 0.0,
      map: null
    };
  
    this.glow = {
      color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: 0.0,
      map: null
    };

  }

  bind(shader) {
    let 
      //s = Renderer.boundShader;
      s = shader;

    // bind vec4 props
    s.links.vec4("uAmbientColor", this.ambient.color);
    s.links.vec4("uDiffuseColor", this.diffuse.color);
    s.links.vec4("uSpecularColor", this.specular.color);
    s.links.vec4("uEnvironmentColor", this.environment.color);
    s.links.vec4("uDetailColor", this.detail.color);
    s.links.vec4("uGlowColor", this.glow.color);

    // bind packd props
    s.links.vec4("uFloatChannel[0]", new Vector4(
      this.ambient.occlusion.intensity,
      this.diffuse.intensity,
      this.specular.intensity,
      this.specular.hardness
    ));
    s.links.vec4("uFloatChannel[1]", new Vector4(
      this.bump.height.scale,
      this.environment.intensity,
      this.detail.intensity,
      this.glow.intensity
    ));

    // bind samplers
    let flags = [0,0,0,0,0,0,0,0];
    if(this.ambient.occlusion.map) {
      s.texture2D(0, this.ambient.occlusion.map); flags[0] = 1;
      s.links.sampler2D("uAmbientOcclusionMap", 0);
    }
    if(this.diffuse.map) {
      s.texture2D(1, this.diffuse.map); flags[1] = 1;
      s.links.sampler2D("uDiffuseMap", 1);
    }
    if(this.specular.map) {
      s.texture2D(2, this.specular.map); flags[2] = 1;
      s.links.sampler2D("uSpecularMap", 2);
    }
    if(this.bump.normal.map) {
      s.texture2D(3, this.bump.normal.map); flags[3] = 1;
      s.links.sampler2D("uNormalMap", 3);
    }
    if(this.bump.height.map) {
      s.texture2D(4, this.bump.height.map); flags[4] = 1;
      s.links.sampler2D("uHeightMap", 4);
    }
    if(this.environment.map) {
      s.textureCube(5, this.environment.map); flags[5] = 1;
      s.links.samplerCube("uEnvironmentMap", 5);
    }
    if(this.detail.map) {
      s.texture2D(6, this.detail.map); flags[6] = 1;
      s.links.sampler2D("uDetailMap", 6);
    }
    if(this.glow.map) {
      s.texture2D(7, this.glow.map); flags[7] = 1;
      s.links.sampler2D("uGlowMap", 7);
    }

    // bind flags
    s.links.ivec4("uIntChannel[0]", new Vector4(...flags.slice(0,4)));
    s.links.ivec4("uIntChannel[1]", new Vector4(...flags.slice(4,8)));
  }
}

export default Material;
