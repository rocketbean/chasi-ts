import Vue from "vue";
import axios from "axios";
let api = axios.create({
  baseURL: "http://localhost:3000/api",
});

var handler = {
  install: (Vue, options) => {
    Vue.$api = options;
    Vue.prototype.$api = options.api;
  },
};
Vue.use(handler, { api });

export { api };
