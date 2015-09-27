import Vector4 from "../../math/vector4";


class Material {
  constructor(name) {
    this.name = name;

    this.castShadow = true;

    this.ambient = {
      color: new Vector4(1.0, 1.0, 1.0, 1.0),
      intensity: 1.0,
      occlusion: {
        map: null,
        intensity: 0.0
      }
    };

    this.diffuse = {
      color: new Vector4(1.0, 1.0, 1.0, 1.0),
      intensity: 1.0,
      map: null
    };

    this.specular = {
      color: new Vector4(1.0, 1.0, 1.0, 1.0),
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
      color: new Vector4(1.0, 1.0, 1.0, 1.0),
      intensity: 1.0,
      map: null
    };

    this.detail = {
      intensity: 1.0,
      map: null
    };
  
    this.glow = {
      color: new Vector4(1.0, 1.0, 1.0, 1.0),
      intensity: 1.0,
      map: null
    };

  }

  bind() {

  }

  unbind() {

  }
}