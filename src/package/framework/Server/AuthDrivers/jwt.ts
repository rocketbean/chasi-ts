import { AuthDriver, Iobject } from "../../Interfaces.js";
import jwt from "jsonwebtoken";
import Models from "../../Database/Models.js";
import Endpoint from "../../Router/Endpoint.js";

export default class JWTDriver implements AuthDriver {
  /**
   * this array will contain the
   * list of routes that won't be
   * implementing this Authentication
   * Driver
   */
  public authExceptions: Iobject[] = [];

  /**
   * this key will be used to
   * encrypt / decript JWT key
   */
  public encryptionkey: string;
  constructor(public property: Iobject) {
    this.property = property;
    this.authExceptions = this.property.AuthRouteExceptions;
  }

  /**
   * authorization method
   * used to attach to an endpoint
   * to impliment JWT security token
   *
   */
  authorize(ep: Endpoint, AuthRouteExceptions: Iobject) {
    return async (request, response, next) => {
      try {
        let checkException = AuthRouteExceptions.findIndex((obj) => {
          if (obj.url == ep.path && obj.m == ep.property.method.toUpperCase())
            return obj;
        });
        if (checkException < 0) {
          const _t = request.header("Authorization")?.replace("Bearer ", "");
          const _d = jwt.verify(_t, this.property.key);
          const user = await Models.collection[this.property.model].findOne({
            _id: _d._id,
          });
          request.auth = { user, _t };
        }
        next();
      } catch (e) {
        response.status(401).send(Caveat.config.responses["401"]);
      }
    };
  }
}
