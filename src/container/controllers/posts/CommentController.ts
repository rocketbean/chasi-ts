import Controller from "../../../package/statics/Controller.js";

export default class CommentController extends Controller {

  /**
   * creates (Comment) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {} translated as [ExpressResponse] Object
   * */
  async create(request, response) {
    return "commentList"
  }

  /**
   * refers to a single (Comment) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
  }

  /**
   * lists a (Comment) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   *
   * */
  async list(request, response) {
    return "commentList"
  }

  /**
   * Delete/s a (Comment) ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   *
   * */
  async delete(request, response) {}

  /**
   * Updates a (Comment) ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {}

}