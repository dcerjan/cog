import gl from "../gl";

  
class Texture {
  constructor(name) {
    this.name = name;
    this.id = gl.createTexture();
    this.image = null;

    this.internalFormat = gl.RGBA;
    this.formatType = gl.UNSIGNED_BYTE;
    this.minFilter = gl.LINEAR;
    this.maxFilter = gl.LINEAR;
    this.wrapS = gl.CLAMP_TO_EDGE;
    this.wrapT = gl.CLAMP_TO_EDGE;
  }

  generateMipmaps() {
    if(this.image) {
      this.bind();
      gl.generateMipmap();
      this.unbind();
    } else {
      throw new Error("Texture.generateMipmaps() cannot be called on texture with no texture data!");
    }
  }

  filtering(minFilter, magFilter, wrapS, wrapT) {
    this.minFilter = minFilter;
    this.magFilter = magFilter;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
  }

  format(internalFormat, formatType) {
    this.internalFormat = internalFormat;
    this.formatType = formatType;
  }

  image(image, imageFormat, cb) {
    this.bind();
    this.image = image;
    this.imageFormat = imageFormat;
    cb();
    this.unbind();
  } 

  bind() { throw new Error("Texture.bind is not implemented!"); } 
  unbind() { throw new Error("Texture.unbind is not implemented!"); } 
}

class Texture2D extends Texture {
  constructor(name) {
    super(name);
  }

  image(image, imageFormat) {
    super.image(image, imageFormat, () => {
      gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.imageFormat, this.formatType, image.bytes());
    });
  }

  bind() { gl.bindTexture(gl.TEXTURE_2D, gl.id); }
  unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
}

class TextureCube extends Texture {
  constructor(name) {
    super(name);
  }

  image(images, imageFormat) {
    super.image(image, imageFormat, () => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.internalFormat, this.imageFormat, this.formatType, images[0].bytes());
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.internalFormat, this.imageFormat, this.formatType, images[1].bytes());
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.internalFormat, this.imageFormat, this.formatType, images[2].bytes());
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.internalFormat, this.imageFormat, this.formatType, images[3].bytes());
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.internalFormat, this.imageFormat, this.formatType, images[4].bytes());
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.internalFormat, this.imageFormat, this.formatType, images[5].bytes());
    });
  }

  bind() { gl.bindTexture(gl.TEXTURE_CUBE_MAP, gl.id); }
  unbind() { gl.bindTexture(gl.TEXTURE_CUBE_MAP, null); }
}

export {Texture2D, TextureCube};
