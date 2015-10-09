let
  canvas = null,
  exts = null,
  gl = null;


let getExtensions = () => {
  let
    ext = gl.getSupportedExtensions();

  console.info("Suported extensions: " + JSON.stringify(ext));

  window.exts = exts = ext.reduce( (memo, ext) => {
    console.info("Loading WebGL Extension: " + ext);
    memo[ext] = gl.getExtension(ext);
    return memo;
  }, {});

  gl.extensions = exts;
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

    gl.clearColor(0.7, 0.7, 0.7, 1.0); gl.inc();
    gl.clearDepth(1.0); gl.inc();
    gl.enable(gl.DEPTH_TEST); gl.inc();
    gl.enable(gl.CULL_FACE); gl.inc();
    gl.frontFace(gl.CCW); gl.inc();
    gl.cullFace(gl.BACK); gl.inc();

  } catch(error) {
    console.log(error);
  }

  if(!gl) {
    window.alert("WebGL is not supported in this browser!");
  }
})();

export default gl;

