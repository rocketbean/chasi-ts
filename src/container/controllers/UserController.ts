import Service from "../../package/framework/Services/Service.js";
import Controller from "../../package/statics/Controller.js";
import User from "../models/user.js";
export default class UserController extends Controller {
  get user() {
    return this.models.user;
  }
  /**
   * Write a New ModelEntry
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {
    const user = await User.find({})
    return user;
  }

  /**
   * Single ObjectModel[index]
   *
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
    return request.params.__user;
  }

  /**
   * Single ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   *
   * */
  async welcome(request, response) {}

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
