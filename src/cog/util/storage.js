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

  delete: () => {
    window.localStorage.delete();
  }
};

export default Db;