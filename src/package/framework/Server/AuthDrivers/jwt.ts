import { AuthDriver, Iobject } from "../../Interfaces.js";
import jwt from "jsonwebtoken";
import Models from "../../Database/Models.js";
import Endpoint from "../../Router/Endpoint.js";
import { Request, Response, NextFunction } from "express";
import { RouteExceptions } from "Chasi/Router";

export default class JWTDriver implements AuthDriver {
  public authExceptions: RouteExceptions[] = [];
  public encryptionkey: string;

  constructor(public property: Iobject) {
    this.property = property;
    this.authExceptions = this.property.AuthRouteExceptions;
  }

  authorize(ep: Endpoint, AuthRouteExceptions: RouteExceptions[]): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const checkException = AuthRouteExceptions.findIndex((obj) => {
          if (
            obj.url == ep.path &&
            obj.m.toUpperCase() == ep.property.method.toUpperCase()
          )
            return obj;
        });
        if (checkException < 0) {
          const _t = request.header("Authorization")?.replace("Bearer ", "") ?? "";
          const _d = jwt.verify(_t, this.property.key as string) as jwt.JwtPayload;

          const user = await Models.collection[this.property.model as string].findOne({
            _id: _d._id,
          });
          (request as Request & { auth: unknown }).auth = { user, _t };
        }
        next();
      } catch (e: unknown) {
        const caveatConfig = (Caveat as unknown as Record<string, Record<string, unknown>>).config;
        response.status(401).send(caveatConfig?.responses?.["401"]);
      }
    };
  }
}
