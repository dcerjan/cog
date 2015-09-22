import guid from "./guid";

class Store {
  constructor() {
    this.id = guid();
    this.data = {};
  }

  set(key, value) {
    if(this.data[key]) {
      if(this.data[key].clear) {
        this.data[key].clear();
      }
    }
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }

  remove(key) {
    if(this.data[key]) {
      if(this.data[key].clear) {
        this.data[key].clear();
      }
      delete this.data[key];
    }
  }

  clear() {
    Object.keys(this.data).forEach( (k) => {
      if(this.data[key].clear) {
        this.data[key].clear();
      }
    });
    this.data = {};
  }
}

export default Store;
