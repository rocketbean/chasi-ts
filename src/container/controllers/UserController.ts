import Controller from "../../package/statics/Controller.js";

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
    // maybe add some validations here ?
    return await this.user.create({...request.body})
  }


  /**
   * refers to a single (User) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async index(request, response) {
    return await this.user.findOne({id: request.params.user})
  }

  /**
   * lists a (User) ObjectModel[index]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async list(request, response) {
    return await this.user.find({})
  }

  /**
   * Delete an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Bool} translated as [ExpressResponse] Object
   *
   * */
  async delete(request, response) {
    return await request.params.__user.delete()
  }

  /**
   * Update an ObjectModel[]
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async update(request, response) {
    let user = request.params.__user;
    // maybe add some validations here ?
    user = Object.assign(user, request.body)
    return await user.save();
  }

  /**
   * return the user object 
   * with JWT Auth token
   * @param {request} [ExpressRequest] Object
   * @return {Object} translated as [ExpressResponse] Object
   * */
  async signin (request, response) {
    try {
      let {email, pass} = request?.body
      let user = await this.user.findByCredentials(email, pass)
      let token = await user.generateAuthToken("dev");
      return {user, token};
    } catch(e: any) {
      throw e;
    }
  }

  async forget (request, response) {
    return await this.user.collection.drop();
  }

}
