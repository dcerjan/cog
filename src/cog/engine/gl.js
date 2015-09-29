let
  canvas = null,
  exts = null,
  gl = null;


let getExtensions = () => {
  let
    ext = gl.getSupportedExtensions();

  console.info("Suported extensions: " + JSON.stringify(ext));

  window.exts = exts = ext.map( (ext) => {
    console.info("Loading WebGL Extension: " + ext);
    return gl.getExtension(ext);
  });

  gl.extensions = ext;
};

(() => {
  canvas = window.document.getElementById("webgl");

  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    canvas.addEventListener("webglcontextlost", (event) => {
      console.log("context lost");
      event.preventDefault();
    }, false);

    canvas.addEventListener("webglcontextrestored", () => {
      console.log("context restored");
    }, false);

    getExtensions();
    window.gl = gl;

    gl.__statsCalls = 0;
    gl.inc = () => { gl.__statsCalls++; };
    gl.reset = () => { gl.__statsCalls = 0; };
    gl.read = () => { return gl.__statsCalls; };

  } catch(error) {
  }

  if(!gl) {
    window.alert("WebGL is not supported in this browser!");
  }
})();

export default gl;

