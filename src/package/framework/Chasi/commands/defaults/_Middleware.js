import path from "path";

export default {
  name: "middleware",
  defaultPath: "./src/container/middlewares",
  options: {
    params: { name: "" },
  },
  pre: function (filename) {
    let _m = {};
    let fn = filename.split("/").pop();
    _m["name"] = fn.capitalize();
    _m["ext"] = ".mw.ts";
    _m["path"] = path.join(this.defaultPath, _m["name"] + _m["ext"]);
    _m["service"] = this.name;

    return Object.assign(this.options.params, _m);
  },
  process: function (filename) {
    this.params = this.pre(filename);
    return {
      params: this.params,
      template: this.template(this.params),
    };
  },
  template: (model) => {
    return `export default async (request, response, next) => {
  /**
   * write your endpoint middleware here. 
   */
  next();
};`;
  },
};
