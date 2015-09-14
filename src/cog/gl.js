let
  canvas = null,
  gl = null;

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

  } catch(error) {
  }

  if(!gl) {
    window.alert("WebGL is not supported in this browser!");
  }
})();

export default gl;

