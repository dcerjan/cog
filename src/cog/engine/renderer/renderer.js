import gl from "./gl";
import FrameBuffer from "./framebuffer";
import Surface from "./surface";
import Shader from "./shader";
import Loader from "../../util/loader";
import Store from "../../util/store";

import Entity from "../scene/entity/entity";
import Prop from "../scene/entity/prop";
import Light from "../scene/entity/light";

let contextProperties = {
  maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
};


class DeferredRenderer {

  constructor(width, height, scale) {
    this.size = { width, height, scale };

    this.fbo = {
      deferred: new FrameBuffer(width * scale, height * scale)
    };

    this.fbo.deferred.addRenderTargetFloat(0);
    this.fbo.deferred.addRenderTarget(1);
    this.fbo.deferred.addRenderTarget(2);
    this.fbo.deferred.addRenderTarget(3);
    this.fbo.deferred.addRenderTarget(4);
    this.fbo.deferred.addRenderTargetFloat(5);

    this.surface = new Surface(0,0,1,1);
    this.store = new Store();

    let loader = new Loader("assets/shaders");

    loader.load(
      [
        "blit/blit.vert",
        "blit/blit.frag",
        "deferred/bake.vert", 
        "deferred/bake.frag", 
        "deferred/compose.frag"
      ],
      (asset, _) => { console.info("Asset " + asset + " loaded"); },
      () => {
        this.store.set("shader/deferred/bake", new Shader("shader/deferred/bake", loader.get("deferred/bake.vert"), loader.get("deferred/bake.frag")));
        this.store.set("shader/deferred/compose", new Shader("shader/deferred/compose", loader.get("blit/blit.vert"), loader.get("deferred/compose.frag")));
        this.store.set("shader/blit/blit", new Shader("shader/blit/blit", loader.get("blit/blit.vert"), loader.get("blit/blit.frag")));

        this.ready();
      }
    );
  }
    
  ready() {
    this.shader = {
      /* ===================== */
      /* =  Utility shaders  = */
      /* ===================== */
      effect: {
        blur: {
          gaussian: this.store.get("shader/effect/blur/gaussian"),
          box: this.store.get("shader/effect/blur/box"),
        },
        egdeDetect: {
          freiChen: this.store.get("shader/effect/edge_detect/frei_chen"),
          sobel: this.store.get("shader/effect/edge_detect/sobel")
        },
        godRay: this.store.get("shader/effect/god_ray"),
        bloom: this.store.get("shader/effect/bloom") 
      },


      /* ======================== */
      /* =  Shadow map shaders  = */
      /* ======================== */
      shadow: {
        pcf: this.store.get("shader/shadow/pcf"),
        vsm: this.store.get("shader/shadow/vsm")
      },


      /* =========================================== */
      /* =  Environemnt map shaders (light probe)  = */
      /* =========================================== */
      environemnt: {
        probe: this.store.get("shader/environemnt/probe")
      },


      /* ===================== */
      /* =  Surface shaders  = */
      /* ===================== */
      surface: {
        blit: this.store.get("shader/surface/blit"),
        debug: {
          blit: {
            position: this.store.get("shader/surface/debug/position"),
            depth: this.store.get("shader/surface/debug/depth"),
            normal: this.store.get("shader/surface/debug/normal"),
            diffuse: this.store.get("shader/surface/debug/diffuse"),
            specular: this.store.get("shader/surface/debug/specular")
          }
        }
      },


      /* ====================== */
      /* =  Deferred shaders  = */
      /* ====================== */
      deferred: {
        bake: this.store.get("shader/deferred/bake"),
        compose: this.store.get("shader/deferred/compose")
      }
    };

    this.pass = {
      shadow: (scene) => {},
      bloom: (scene) => {},
      deferred: {
        bake: (scene) => {
          let shader = this.shader.deferred.bake;
          this.fbo.deferred.begin([0,1,2,3,4,5]);

          shader.bind();
          shader.links.mat4("uProjection", scene.camera.projection);

          // build entity specific draw lists
          let 
            light = [],
            lightProbe = [],
            drawable = [],
            //camera = [],

            drawList;

          scene.graph.traverse( (node) => {
            node.entity.forEach( (e) => {
              if(!e instanceof Entity)          { throw new Error("object is ot an entity!"); } 
              //else if(e instanceof Actor)       { drawable.push({entity: e, node: node}); } 
              else if(e instanceof Prop)        { drawable.push({entity: e, node: node}); } 
              //else if(e instanceof Emitter)     { drawable.push({entity: e, node: node}); }
              else if(e instanceof Light)       { light.push({entity: e, node: node}); } 
              //else if(e instanceof Light.Probe) { lightProbe.push({entity: e, node: node}); }
              //else if(e instanceof Camera)      { camera.push({entity: e, node: node}); }  <-- maybe something can be done?
            });
          });

          drawList = drawable.reduce( (memo, d) => {
            if(!memo[d.node.name]) {
              memo[d.node.name] = { transform: d.node.totalTransform, drawables: []};
            }
            memo[d.node.name].drawables.push(d.entity);
            return memo;
          }, {});

          Object.keys(drawList).forEach( (k) => {
            shader.links.mat4("uModelView", scene.camera.node.totalTransform.inverse().mul(drawList[k].transform));

            drawList[k].drawables.forEach( (d) => {
              d.material.bind(shader);
              d.mesh.draw();
            });
          });

          this.fbo.deferred.end();
        },
        compose: (scene) => {
          gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); gl.inc();
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.inc();

          this.shader.deferred.compose.bind();
          this.shader.deferred.compose.links.sampler2D("fPosition", 0);
          this.shader.deferred.compose.links.sampler2D("fDepth", 1);
          this.shader.deferred.compose.links.sampler2D("fNormal", 2);
          this.shader.deferred.compose.links.sampler2D("fDiffuse", 3);
          this.shader.deferred.compose.links.sampler2D("fSpecular", 4);

          this.shader.deferred.compose.texture2D(0, this.fbo.deferred.renderTarget[0]);
          this.shader.deferred.compose.texture2D(1, this.fbo.deferred.depthBuffer);
          this.shader.deferred.compose.texture2D(2, this.fbo.deferred.renderTarget[1]);
          this.shader.deferred.compose.texture2D(3, this.fbo.deferred.renderTarget[2]);
          this.shader.deferred.compose.texture2D(4, this.fbo.deferred.renderTarget[3]);
          this.surface.blit();
        }
      }
    };

    this._ready = true;
  }

  render(scene) {
    if(this._ready) {
      this.pass.deferred.bake(scene);
      this.pass.deferred.compose(scene);
      
      for(let i = 0; i < contextProperties.maxTextureUnits; i++) {
        gl.activeTexture(gl.TEXTURE0 + i); gl.inc();
        gl.bindTexture(gl.TEXTURE_2D, null); gl.inc();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null); gl.inc();
      }
    }
  }

}

let Renderer = new DeferredRenderer(2880, 1800, 0.5);
//let Renderer = new DeferredRenderer(1920, 1200, 0.5);

export default Renderer;
