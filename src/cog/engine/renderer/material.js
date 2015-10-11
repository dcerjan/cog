import Vector4 from "../../math/vector4";
//import Renderer from "../renderer/renderer";

class Material {
  constructor(name) {
    this.name = name;

    this.castShadow = true;

    this.ambient = {
      color: (color) => { this.ambient._color = color; return this; }, _color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: (intensity) => { this.ambient._intensity = intensity; return this; }, _intensity: 0.0,
      occlusion: {
        map: (map) => { this.ambient.occlusion._map = map; return this; }, _map: null,
        intensity: (intensity) => { this.ambient.occlusion._intensity = intensity; return this; }, _intensity: 0.0
      }
    };

    this.diffuse = {
      color: (color) => { this.diffuse._color = color; return this; }, _color: new Vector4(0.25, 0.25, 0.25, 1.0),
      intensity: (intensity) => { this.diffuse._intensity = intensity; return this; }, _intensity: 1.0,
      map: (map) => { this.diffuse._map = map; return this; }, _map: null,
    };

    this.specular = {
      color: (color) => { this.specular._color = color; return this; }, _color: new Vector4(0.2, 0.4, 0.7, 1.0),
      intensity: (intensity) => { this.specular._intensity = intensity; return this; }, _intensity: 1.0,
      hardness: (hardness) => { this.specular._hardness = hardness; return this; }, _hardness: 1,
      map: (map) => { this.specular._map = map; return this; }, _map: null,
    };

    this.bump = {
      normal: {
        map: (map) => { this.bump.normal._map = map; return this; }, _map: null
      },
      height: {
        map: (map) => { this.bump.height._map = map; return this; }, _map: null,
        scale: (scale) => { this.specular._scale = scale; return this; }, _scale: 1.0
      }
    };

    this.environment = {
      color: (color) => { this.environment._color = color; return this; }, _color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: (intensity) => { this.environment._intensity = intensity; return this; }, _intensity: 0.0,
      map: (map) => { this.environment._map = map; return this; }, _map: null
    };

    this.detail = {
      color: (color) => { this.detail._color = color; return this; }, _color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: (intensity) => { this.detail._intensity = intensity; return this; }, _intensity: 0.0,
      map: (map) => { this.detail._map = map; return this; }, _map: null
    };
  
    this.glow = {
      color: (color) => { this.glow._color = color; return this; }, _color: new Vector4(0.0, 0.0, 0.0, 0.0),
      intensity: (intensity) => { this.glow._intensity = intensity; return this; }, _intensity: 0.0,
      map: (map) => { this.glow._map = map; return this; }, _map: null
    };
  }

  bind(shader) {
    let 
      //s = Renderer.boundShader;
      s = shader;

    // bind vec4 props
    s.links.vec4("uAmbientColor", this.ambient._color);
    s.links.vec4("uDiffuseColor", this.diffuse._color);
    s.links.vec4("uSpecularColor", this.specular._color);
    s.links.vec4("uEnvironmentColor", this.environment._color);
    s.links.vec4("uDetailColor", this.detail._color);
    s.links.vec4("uGlowColor", this.glow._color);

    // bind packed props
    s.links.vec4("uFloatChannel[0]", new Vector4(
      this.ambient.occlusion._intensity,
      this.diffuse._intensity,
      this.specular._intensity,
      this.specular._hardness
    ));
    s.links.vec4("uFloatChannel[1]", new Vector4(
      this.bump.height._scale,
      this.environment._intensity,
      this.detail._intensity,
      this.glow._intensity
    ));

    // bind samplers
    let flags = [0,0,0,0,0,0,0,0];
    if(this.ambient.occlusion._map) {
      s.texture2D(0, this.ambient.occlusion._map); flags[0] = 1;
      s.links.sampler2D("uAmbientOcclusionMap", 0);
    }
    if(this.diffuse._map) {
      s.texture2D(1, this.diffuse._map); flags[1] = 1;
      s.links.sampler2D("uDiffuseMap", 1);
    }
    if(this.specular._map) {
      s.texture2D(2, this.specular._map); flags[2] = 1;
      s.links.sampler2D("uSpecularMap", 2);
    }
    if(this.bump.normal._map) {
      s.texture2D(3, this.bump.normal._map); flags[3] = 1;
      s.links.sampler2D("uNormalMap", 3);
    }
    if(this.bump.height._map) {
      s.texture2D(4, this.bump.height._map); flags[4] = 1;
      s.links.sampler2D("uHeightMap", 4);
    }
    if(this.environment._map) {
      s.textureCube(5, this.environment._map); flags[5] = 1;
      s.links.samplerCube("uEnvironmentMap", 5);
    }
    if(this.detail._map) {
      s.texture2D(6, this.detail._map); flags[6] = 1;
      s.links.sampler2D("uDetailMap", 6);
    }
    if(this.glow._map) {
      s.texture2D(7, this.glow._map); flags[7] = 1;
      s.links.sampler2D("uGlowMap", 7);
    }

    // bind flags
    s.links.ivec4("uIntChannel[0]", new Vector4(...flags.slice(0,4)));
    s.links.ivec4("uIntChannel[1]", new Vector4(...flags.slice(4,8)));
  }
}

export default Material;
