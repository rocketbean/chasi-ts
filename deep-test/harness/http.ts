/**
 * Supertest HTTP helper for the INTEGRATION http-e2e tier.
 *
 * Port of test/helper.ts, adapted to the deep-test app bootstrap. Drives the
 * live Express app, handles auth token capture, and prefixes a base path.
 *
 *   import { HttpClient } from "../../harness/http.ts";
 *   const client = new HttpClient({ basePath: "/api", signinUrl: "/api/users/signin" });
 *   const res = await client.send({ url: "/users", method: "get" });
 */
import request from "supertest";
import { expressApp } from "./app.ts";

export type HttpMethod = "post" | "get" | "put" | "patch" | "delete";

export type HttpClientOptions = {
  basePath: string;
  signinUrl?: string;
};

export type SendOptions = {
  url: string;
  method?: HttpMethod;
  query?: string;
  data?: Record<string, any>;
  /** When true, `url` is used verbatim (no basePath prefix). */
  raw?: boolean;
  headers?: Record<string, string>;
  logUrl?: boolean;
};

export class HttpClient {
  public auth: { user?: Record<string, any>; token?: string } = {};

  constructor(public opts: HttpClientOptions) {}

  get token() {
    return this.auth?.token ? this.auth.token : false;
  }

  /** POST credentials to signinUrl and capture { user, token } for later requests. */
  async authenticate(data: { email: string; pass?: string; password?: string }) {
    const res = await this.send({
      url: this.opts.signinUrl!,
      method: "post",
      raw: true,
      data,
    });
    if ([200, 201].includes(res.statusCode)) this.auth = res.body;
    return this.auth;
  }

  async send(options: SendOptions) {
    const app = await expressApp();
    const method = options.method ?? "post";
    const url = options.raw ? options.url : this.opts.basePath + options.url;
    if (options.logUrl) console.log(`[${method}]: ${url}`);

    let req = request(app)[method](url);
    if (this.token) req = req.set("Authorization", this.token);
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) req = req.set(k, v);
    }
    if (options.query) req = req.query(options.query);
    return await req.send(options.data ?? undefined);
  }
}
