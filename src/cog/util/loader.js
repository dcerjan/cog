import Ajax from "../util/ajax";

class Loader {
  constructor(url) {
    this.url = url;
    this.assets = {};
  }

  load(resources, afterOne, afterAll) {
    Promise.all( resources.map( (resource) => 
      Ajax.get({
        url: this.url + "/" + resource
      }).catch( (reason) => {
        console.error(reason);
        if(afterOne) { afterOne(resource, null); }
      }).then( (data) => {
        this.assets[resource] = data;
        if(afterOne) { afterOne(resource, data); }
      })
    )).then( (data) => { 
      if(afterAll) { 
        afterAll(); 
      }
    });
  }

  get(key) {
    return this.assets[key];
  }
}

export default Loader;