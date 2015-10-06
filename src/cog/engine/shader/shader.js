import gl from "../gl";

let compileStageFromSource = (type, source) => {
  let s = gl.createShader((type === 'vertex') ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER); gl.inc();
  gl.shaderSource(s, source); gl.inc();
  gl.compileShader(s); gl.inc();
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error("Shader.compileStageFromSource could not compile " + type + " shader: " + gl.getShaderInfoLog(s));
  }
  gl.inc();
  return s;
};


let removeComments = (source) => {
  let ret, i, comment, inlineComment;

  comment = false;
  inlineComment = false;
  ret = "";

  for(i = 0; i < source.length; i += 1) {
    if(source[i] === '/' && source[i + 1] === '*') {
      i += 1;
      comment = true;
    } else if(source[i] === '*' && source[i + 1] === '/') {
      i += 1;
      comment = false;
    } else if(source[i] === '/' && source[i + 1] === '/') {
      i += 1;
      inlineComment = true;
    } else if(inlineComment && source[i] === '\n') {
      inlineComment = false;
    } else if(!comment && !inlineComment) {
      ret += source[i];
    }
  }

  return ret;
};


let parseUniforms = (source) => {
  // TODO parse structs
  let
    ret,
    matchUniformDeclaration,
    matchSymbol,
    matchArrayVariable,
    matchVariable,
    matchedVars;

  matchUniformDeclaration = /uniform[^;]*;/g;
  matchSymbol =             /[ \t\n]*[a-zA-Z_][a-zA-Z_0-9]*(\[[ \t\n]*[1-9][0-9]*[ \t\n]*\])?[ \t\n]*[,;]{1}/g;
  matchArrayVariable =      /[a-zA-Z_][a-zA-Z_0-9]*\[[1-9][0-9]*\]/g;
  matchVariable =           /[a-zA-Z_][a-zA-Z_0-9]*/g;

  ret = {};

  matchedVars = source.match(matchUniformDeclaration);

  if(matchedVars) {
    matchedVars.forEach(function(v) {
      let
        matchedSymbols;

      matchedSymbols = v.match(matchSymbol);
      matchedSymbols.forEach(function(s) {
        s = s.split(" ").join("")
             .split("\t").join("")
             .split("\r").join("")
             .split("\n").join("")
             .split(",").join("")
             .split(";").join("");

        if(s.match(matchArrayVariable)) {
          let
            symbolName = s.split("[")[0],
            size = parseInt(s.split("[")[1].split("]")[0], 10) - 1;

          while(size >= 0) {
            ret["" + symbolName + "[" + size + "]"] = null;
            size--;
          }
        } else if(s.match(matchVariable)) {
          ret[s] = null;
        }

      });
    });
  }

  return ret;
};


let parseAttributes = (source) => {
  var
    attribute = /[ \t\r\n]*attribute[ \t\r\n]+[a-zA-Z0-9]+[ \t\r\n]+[a-zA-Z_0-9]+[ \t\r\n]*;/g;

  attribute = source.match(attribute).reduce( (memo, attr) => {
    
    attr = attr.match(/^[ \t\r\n]*attribute[ \t\r\n]+[a-zA-Z0-9]+[ \t\r\n]+([a-zA-Z_0-9]+)[ \t\r\n]*;$/);

    if(attr) {
      attr = attr.pop();
      attr = attr.split(" ").join("")
                 .split("\t").join("")
                 .split("\r").join("")
                 .split("\n").join("")
                 .split(",").join("")
                 .split(";").join("");

      memo[attr] = null;
    }

    return memo;
  }, {});

  return attribute;
};


class Shader {
  constructor(name, vertexSource, fragmentSource) {
    if(typeof vertexSource !== "string") {
      throw new Error("Vertex source is not of type 'string'!");
    }

    if(typeof fragmentSource !== "string") {
      throw new Error("Fragment source is not of type 'string'!");
    }

    this.name = name;

    this.id = gl.createProgram(); gl.inc();
    this.vid = compileStageFromSource("vertex", vertexSource); gl.inc();
    this.fid = compileStageFromSource("fragment", fragmentSource); gl.inc();

    gl.attachShader(this.id, this.vid); gl.inc();
    gl.attachShader(this.id, this.fid); gl.inc();

    ["vPosition", "vNormal", "vTangent", "vColor", "vTexCoord", "vTexCoordAlt", "vBoneIndex", "vBoneWeight"].forEach( (n, i) => {
      gl.bindAttribLocation(this.id, i, n); gl.inc();
    });

    gl.linkProgram(this.id); gl.inc();
    if(!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
      throw new Error("Could not link the shader program!");
    } else {
      console.info("Shader '" + name + "' succesfully compiled and linked");
    }
    gl.inc();

    // safe to delete shaders since they are no longer needed
    // after linking, compiled shaders are stored under a program
    gl.deleteShader(this.vid); gl.inc();
    gl.deleteShader(this.fd); gl.inc();

    this.uniforms = {
      vertex: parseUniforms(removeComments(vertexSource)),
      fragment: parseUniforms(removeComments(fragmentSource))
    };

    Object.keys(this.uniforms.vertex).forEach( (k) => {
      let l = gl.getUniformLocation(this.id, k); gl.inc();
      if(l) { 
        this.uniforms.vertex[k] = l; 
      } else {
        console.info("Shader.constructor [Vertex] uniform " + k + " optimized out during shader compile");
        delete this.uniforms.vertex[k];
      }
    });

    Object.keys(this.uniforms.fragment).forEach( (k) => {
      let l = gl.getUniformLocation(this.id, k); gl.inc();
      if(l) { 
        this.uniforms.fragment[k] = l; 
      } else {
        console.info("Shader.constructor [Fragment] uniform " + k + " optimized out during shader compile");
        delete this.uniforms.fragment[k];
      }
    });

    this.attributes = {};
    Object.keys(parseAttributes(removeComments(vertexSource))).forEach( (attr) => {
      let l = gl.getAttribLocation(this.id, attr); gl.inc();
      if(l !== undefined && l !== null) { this.attributes[attr] = l; }
    });

    this.links = {};

    let makeLink = (cb, name, value) => {
      if( (this.uniforms.vertex[name] === undefined) && (this.uniforms.fragment[name] === undefined) ) {
        //console.warn("Uniform '" + name + " not present in compiled shader.");
      } else {
        let 
          loc;

        loc = this.uniforms.fragment[name];
        if(loc === undefined) {
          loc = this.uniforms.vertex[name];
        }
        cb(loc, value);
      }
    };

    this.links["boolean"] = makeLink.bind(this, (uniform, value) => { gl.uniform1i(uniform, value); gl.inc(); });
    this.links["bvec2"] = makeLink.bind(this, (uniform, value) => { gl.uniform2i(uniform, value.x, value.y); gl.inc(); });
    this.links["bvec3"] = makeLink.bind(this, (uniform, value) => { gl.uniform3i(uniform, value.x, value.y, value.z); gl.inc(); });
    this.links["bvec4"] = makeLink.bind(this, (uniform, value) => { gl.uniform4i(uniform, value.x, value.y, value.z, value.w); gl.inc(); });

    this.links["int"] = makeLink.bind(this, (uniform, value) => { gl.uniform1i(uniform, value); gl.inc(); });
    this.links["ivec2"] = makeLink.bind(this, (uniform, value) => { gl.uniform2f(uniform, value.x, value.y); gl.inc(); });
    this.links["ivec3"] = makeLink.bind(this, (uniform, value) => { gl.uniform3i(uniform, value.x, value.y, value.z); gl.inc(); });
    this.links["ivec4"] = makeLink.bind(this, (uniform, value) => { gl.uniform4i(uniform, value.x, value.y, value.z, value.w); gl.inc(); });

    this.links["float"] = makeLink.bind(this, (uniform, value) => { gl.uniform1f(uniform, value); gl.inc(); });
    this.links["vec2"] = makeLink.bind(this, (uniform, value) => { gl.uniform2f(uniform, value.x, value.y); gl.inc(); });
    this.links["vec3"] = makeLink.bind(this, (uniform, value) => { gl.uniform3f(uniform, value.x, value.y, value.z); gl.inc(); });
    this.links["vec4"] = makeLink.bind(this, (uniform, value) => { gl.uniform4f(uniform, value.x, value.y, value.z, value.w); gl.inc(); });

    this.links["mat2"] = makeLink.bind(this, (uniform, value) => { gl.uniformMatrix2fv(uniform, false, new Float32Array(value.m)); gl.inc(); });
    this.links["mat3"] = makeLink.bind(this, (uniform, value) => { gl.uniformMatrix3fv(uniform, false, new Float32Array(value.m)); gl.inc(); });
    this.links["mat4"] = makeLink.bind(this, (uniform, value) => { gl.uniformMatrix4fv(uniform, false, new Float32Array(value.m)); gl.inc(); });

    this.links["sampler2D"] = makeLink.bind(this, (uniform, value) => { gl.uniform1i(uniform, value); gl.inc(); });
    this.links["samplerCube"] = makeLink.bind(this, (uniform, value) => { gl.uniform1i(uniform, value); gl.inc(); });
  }

  texture2D(unit, texture) {
    gl.activeTexture(gl.TEXTURE0 + unit); gl.inc();
    gl.bindTexture(gl.TEXTURE_2D, texture.id); gl.inc();
  }

  textureCube(unit, texture) {
    gl.activeTexture(gl.TEXTURE0 + unit); gl.inc();
    gl.bindTexture(gl.TEXTURE_CUBE, texture.id); gl.inc();
  }

  bind() {
    gl.useProgram(this.id); gl.inc();
  }

  unbind() {
    gl.useProgram(null); gl.inc();
  }

  link() {
    return links;
  }

  uniforms() {
    return this.uniforms;
  }

  attributes() {
    return this.attributes;
  }

  delete() {
    gl.deleteProgram(this.id); gl.inc();
  }
}


export default Shader;
