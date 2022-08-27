import Service from "../../package/framework/Services/Service.js";
import Controller from "../../package/statics/Controller.js";
import User from "../models/user.js";
export default class UserController extends Controller {
  /**
   * Write a New ModelEntry
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {}

  /**
   * Single ObjectModel[index]
   *
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
    this.compiler.renderer.resources.errorTemplate = () => {};
    console.log(this.compiler.renderer.resources.errorTemplate);
    let r = await this.compiler.renderRoute("/", {
      app: {
        nuxt: {
          error: (err) => {
            console.log("err");
            return null;
          },
        },
      },
    });
    return r.html;
  }

  /**
   * Single ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   *
   * */
  async welcome(request, response) {
    return "testing";
  }

  /**
   * Delete an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   *
   * */
  async delete(request, response) {}

  /**
   * Update an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {}
}
