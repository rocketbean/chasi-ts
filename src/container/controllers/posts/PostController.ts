import Controller from "../../../package/statics/Controller.js";

export default class PostController extends Controller {
  get user() {
    return this.models.user;
  }
  /**
   * creates (Post) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {
  }

  /**
   * refers to a single (Post) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
  }

  /**
   * lists a (Post) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   *
   * */
  async list(request, response) {}

  /**
   * Delete/s a (Post) ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   *
   * */
  async delete(request, response) {}

  /**
   * Updates a (Post) ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {}
}