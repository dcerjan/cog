import gl from "../gl";
import Store from "../../util/store";

let
  store = new Store(),
  shader;


let
  init = () => {
    shader = {
      /* ===================== */
      /* =  Utility shaders  = */
      /* ===================== */
      effect: {
        blur: {
          gaussian: store.get("shader/effect/blur/gaussian"),
          box: store.get("shader/effect/blur/box"),
        },
        egdeDetect: {
          freiChen: store.get("shader/effect/edge_detect/frei_chen"),
          sobel: store.get("shader/effect/edge_detect/sobel")
        },
        godRay:store.get("shader/effect/god_ray"),
        bloom:store.get("shader/effect/bloom") 
      },


      /* ======================== */
      /* =  Shadow map shaders  = */
      /* ======================== */
      shadow: {
        pcf: store.get("shader/shadow/pcf"),
        vsm: store.get("shader/shadow/vsm")
      },


      /* =========================================== */
      /* =  Environemnt map shaders (light probe)  = */
      /* =========================================== */
      environemnt: {
        probe: store.get("shader/environemnt/probe")
      },


      /* ===================== */
      /* =  Surface shaders  = */
      /* ===================== */
      surface: {
        blit: store.get("shader/surface/blit"),
        compose: store.get("shader/surface/compose"),
        debug: {
          blit: {
            position: store.get("shader/surface/debug/position"),
            depth: store.get("shader/surface/debug/depth"),
            normal: store.get("shader/surface/debug/normal"),
            diffuse: store.get("shader/surface/debug/diffuse"),
            specular: store.get("shader/surface/debug/specular")
          }
        }
      },


      /* ====================== */
      /* =  Deferred shaders  = */
      /* ====================== */
      deferred: {
        bake: store.get("shader/deferred/bake")
      }

    };
  };


let render = (scene) => {

};



let
  Renderer = {
    init: init,
    shader: shader,
    render: render
  };


export default Renderer;
