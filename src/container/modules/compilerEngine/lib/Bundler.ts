import { UserConfig } from "vite";
import path from "path";
import { Iobject } from "../../../../package/framework/Interfaces.js";
import { Express } from "express";
import { readFileSync } from "fs";
import { builderConfig } from "../compiler.js";
export interface BundlerInterface {
  mode: string;
  knownRoutes: string[] | null;
  rebase: Function;
  setup: Function;
  routeRegistry: Function;
  clientBuild?: Function;
  serverBuild?: Function;
}

export default abstract class Bundler implements BundlerInterface {
  public $app: Express;
  /*** $server
   * Vite static compiled ||
   * createServer => createViteServer instance
   */
  public $server;

  protected $render: Function;
  protected $template: any;

  /*** resolve
   * file resolver FN
   */
  protected resolve: Function = (p, cwd = null) =>
    cwd == null ? path.resolve(___location, p) : path.resolve(cwd, p);

  public ssrManifest: Iobject = {};
  public knownRoutes: string[] | null = null;

  protected base: string;
  protected root: string;

  constructor(
    public mode: string,
    protected builderConfig: builderConfig,
    protected _config: UserConfig,
  ) {
    this.root = this.builderConfig.root;
  }

  abstract build();
  abstract routeRegistry();

  get _template_() {
    return readFileSync(this.resolve("index.html", this.root), "utf-8");
  }

  get _clientModule_() {
    return `<script type="module" src="${this.base}entry-client.js"></script>`;
  }

  getSsrModule() {
    if (this.builderConfig.ssrServerModule)
      return path.join(this.root, this.builderConfig.ssrServerModule);
    else return path.join(this.root, "entry-server.js");
  }

  protected isValidRoute(urlPath: string): boolean {
    if (this.knownRoutes === null) return true;
    const clean = (urlPath || "/").split("?")[0].split("#")[0] || "/";
    if (clean === "/" || clean === "") return true;
    return this.knownRoutes.some(
      (r) => clean === r || clean.startsWith(r + "/"),
    );
  }

  protected notFoundResponse(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>404 — Not Found | chasi-ts</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;
         background:#0E0E0E;color:#E8E8E8;font-family:-apple-system,sans-serif}
    .c{text-align:center;padding:40px 24px;max-width:480px}
    .status{font-size:6rem;font-weight:800;letter-spacing:-0.05em;line-height:1;
            background:linear-gradient(135deg,#F59E0B,#FCD34D);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent}
    h1{font-size:1.3rem;font-weight:600;margin:12px 0 8px;color:#E8E8E8}
    p{font-size:.875rem;color:#909090;margin-bottom:28px;line-height:1.6}
    a{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;
      border-radius:6px;background:#F59E0B;color:#000;font-weight:700;
      font-size:.85rem;text-decoration:none;transition:filter .15s}
    a:hover{filter:brightness(1.1)}
  </style>
</head>
<body>
  <div class="c">
    <div class="status">404</div>
    <h1>Page Not Found</h1>
    <p>The route you requested does not exist on this server.</p>
    <a href="/">&#8592; Back to Home</a>
  </div>
</body>
</html>`;
  }

  async rebase(basepath) {
    this.base = basepath;
    this._config.base = basepath;
    this._config.cacheDir = "./temp/." + basepath.replace(/\//g, "");;
  }

  async setup($app: Express) {
    this.$app = $app;
    await this.build();
  }
}
