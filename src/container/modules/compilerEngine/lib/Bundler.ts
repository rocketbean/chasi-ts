import { UserConfig } from "vite";
import path from "path";
import { Iobject } from "../../../../package/framework/Interfaces.js";
import { Express } from "express";
import { readFileSync } from "fs";
import { builderConfig } from "../compiler.js";
export interface BundlerInterface {
  mode: string;
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
    cwd == null ? path.resolve(__dirname, p) : path.resolve(cwd, p);

  public ssrManifest: Iobject = {};

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
