import Ajax from "./ajax";

class Loader {
  constructor(url) {
    this.url = url;
    this.assets = {};
  }

  load(resources, afterOne, afterAll) {
    let loaded = 0;

    resources.map( (resource) => {
      Ajax.get({
        url: this.url + "/" + resource,
        success: (data) => {
          this.assets[resource] = data;
          if(afterOne) { afterOne(resource, data); }
        },
        fail: () => {
          console.error("Unable to fetch data for " + resource);
          if(afterOne) { afterOne(resource, null); }
        },
        done: () => {
          loaded++;
          if(loaded === resources.length) {
            afterAll();
          }
        }
      });
    });
  }

  get() {
    return this.assets;
  }
}

export default Loader;