import path from "path";

export default {
  name: "controller",
  defaultPath: "./src/container/controllers",
  options: {
    params: { name: "", models: [], extras: [] },
  },
  pre: function (filename, args) {
    let _c = {};
    let fn = filename.split("/").pop();
    let _f = fn.capitalize() + "Controller";
    _c["name"] = _f;
    _c["ext"] = ".ts";
    _c["path"] = path.join(this.defaultPath, _c["name"] + _c["ext"]);
    _c["service"] = this.name;

    if (args.model) {
      _c["models"] = this.modelControllerTemplate(filename.capitalize());
    }
    return Object.assign(this.options.params, _c);
  },
  setModelExtras(filename) {},
  process: function (filename, args) {
    this.params = this.pre(filename, args);
    return {
      params: this.params,
      template: this.template(this.params),
    };
  },
  modelControllerTemplate: (model) => {
    return `get ${model.toLowerCase()}() {
    return this.models.${model.toLowerCase()};
  }`;
  },
  template: (controller) => {
    return `import Service from "../../package/framework/Services/Service.js";
import Controller from "../../package/statics/Controller.js";

export default class ${controller.name} extends Controller {
  ${controller.models}
  ${controller.extras}
  /**
   * Write a New ModelEntry
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {

  }

  /**
   * Single ObjectModel[index]
   *
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {

  }

  /**
   * List of ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Array} translated as [ExpressResponse] Object
   * */
  async list(request, response) {
    
  }

  /**
   * Delete an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   *
   * */
  async delete(request, response) {

  }

  /**
   * Update an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {

  }
}`;
  },
};
