import axios from "axios";

export default (app) => {
  let api = axios.create({
    baseURL: "http://localhost:3000/api",
  });

  var handler = {
    install: (app, options) => {
      app.$api = options;
      app.prototype.$api = options.api;
    },
  };

  app.use(handler, { api });
};
