import Controller from "../../package/statics/Controller.js";

export default class MediaController extends Controller {
  /**
   * Write a New ModelEntry
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {}

  /**
   * Single ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
    console.log("on Media");
  }

  /**
   * Single ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async welcome(request, response) {}

  /**
   * Delete an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   * */
  async delete(request, response) {}

  /**
   * Update an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {}
}
