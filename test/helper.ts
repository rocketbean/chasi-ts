import request from "supertest"
import instance from "../src/server"
import * as userMock from "./mocks/user.json"
let users = userMock.data;
export type TestOptions = {
  basePath: string;
  signinUrl?: string;
};
export type HttpMethods =
  | "post"
  | "get"
  | "put"
  | "patch"
  | "update"
  | "delete";

export type submitOptions = {
  url: string;
  method: HttpMethods;
  query?: string;
  data?: { [key: string]: any };
  raw?: boolean;
  logUrl?: boolean;
};
export default class Helper {
  public static AppInstance;

  /** Auth
   * stores information about
   * user and token
   */
  public auth: {
    user?: { [key: string]: any };
    token?: string;
  } = {};

  constructor(public opts: TestOptions) {}

  get app() {
    return Helper.getApp();
  }

  get token() {
    return this?.auth?.token ? this.auth.token : false;
  }

  static getApp() {
    if (!Helper.AppInstance) {
      Helper.AppInstance = instance.$app.$server;
    }
    return Helper.AppInstance;
  }

  async authenticate(data: { email: string; password: string }) {
    let { basePath, signinUrl } = this.opts;
    let res = await this.send({
      url: signinUrl,
      method: "post",
      data: { ...data },
    });
    if ([200, 201].includes(res.statusCode)) {
      this.auth = res.body;
    }

    return this.auth;
  }

  async send(submitOptions) {
    let method = submitOptions?.method ? submitOptions?.method : "post";
    let data = submitOptions?.data ? submitOptions?.data : null;
    let url = submitOptions?.raw
      ? submitOptions.url
      : this.opts.basePath + submitOptions.url;

    if (submitOptions.logUrl) {
      console.log(`[${method}]: ${url}`);
    }
    if (this.token) {
      return await request(this.app)
        [method](url)
        .send(data)
        .set("Authorization", this.token);
    } else {
      return await request(this.app)[method](url).send(data);
    }
  }
}

