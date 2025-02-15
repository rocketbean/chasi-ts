import Bundler, { BundlerInterface } from "./Bundler.js";
import { build, UserConfig } from "vite";
import serveStatic, { RequestHandler } from "serve-static";
import { builderConfig } from "../compiler.js";
import { pathToFileURL } from "url";
import path from "path";
import { readFileSync } from "fs";

export default class prodBundler extends Bundler implements BundlerInterface {
  public clientPath: string;
  public serverPath: string;

  constructor(
    protected builderConfig: builderConfig,
    protected config: UserConfig,
  ) {
    super("prod", builderConfig, config);
    this.config.root = this.builderConfig.root;
    this.clientPath = path.join(
      this.config.root,
      this.builderConfig.clientBuild.outDir,
    );

    this.serverPath = path.join(
      this.config.root,
      this.builderConfig.serverBuild.outDir,
    );
  }

  getSsrModule() {
    if (this.builderConfig.ssrServerModule)
      return path.join(this.serverPath, this.builderConfig.ssrServerModule);
    else return path.join(this.config.build.outDir, "entry-server.js");
  }

  async routeRegistry() {
    let manifest = await this.getDistFile("./.vite/ssr-manifest.json", {
      with: {
        type: "json",
      },
    });
    let routes = [];
    Object.keys(manifest).map((item) => {
      if (item.includes("pages/")) {
        item = item.replace("pages/", "/");
        let _p = item.split(".")[0].toLowerCase();
        if (!routes.includes(_p)) routes.push(_p);
      }
    });
    return routes.map((r) => {
      return { path: r };
    });
  }

  async connectMws() {    this.$app.use(
      this.base,
      //@ts-ignore
      serveStatic(this.clientPath, {
        index: false,
      }),
    );
    this.$app.all("*", async (req, res, next) => {
      if (req.originalUrl.includes(this.base)) {
        try {
          const url = req.originalUrl.replace(this.base, "/");
          let html = await this.render(url);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e) {
          Logger.log(e, "@build error");
        }
      } else next();
    });
  }

  async getDistFile(filename: string, importOptions: any = {}) {
    return (
      await import(
        pathToFileURL(path.join(this.clientPath, filename)).href,
        importOptions
      )
    ).default;
  }

  static setDefConf(builderConfig, config) {
    config.root = builderConfig.root;
    config.base = builderConfig.mountedTo;
    return config;
  }

  static async clientBuild(builderConfig, config) {
    config.build = builderConfig.clientBuild;
    config = prodBundler.setDefConf(builderConfig, config);
    await build(config);
  }
  static async serverBuild(builderConfig, config) {
    config.build = builderConfig.serverBuild;
    config = prodBundler.setDefConf(builderConfig, config);
    await build(config);
  }

  async build() {
    await this.connectMws();
    let _r = pathToFileURL(this.getSsrModule()).href;
    this.$render = (await import(_r)).render;
    this.ssrManifest = await this.getDistFile("./.vite/ssr-manifest.json", {
      with: {
        type: "json",
      },
    });
    this.$template = readFileSync(
      path.join(this.clientPath, "index.html"),
      "utf-8",
    );
  }

  async render(url) {
    try {
      const [appHtml, preloadLinks] = await this.$render(url, this.ssrManifest);
      const html = this.$template
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--client-module-->`, this._clientModule_);
      return html;
    } catch (e) {
      throw e;
    }
  }
}
