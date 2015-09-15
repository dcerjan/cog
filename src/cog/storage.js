let Db = {
  set: (key, value) => {
    window.localStorage.setItem(key, value);
  },

  get: (key) => {
    window.localStorage.getItem(key);
  },

  remove: (key) => {
    windwo.localStorage.removeItem(key);
  },

  clear: () => {
    window.localStorage.clear();
  }
};

export default Db;