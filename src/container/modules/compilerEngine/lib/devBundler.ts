import Bundler, { BundlerInterface } from "./Bundler.js";
import { createServer as createViteServer, UserConfig } from "vite";
import { builderConfig } from "../compiler.js";
export default class devBundler extends Bundler implements BundlerInterface {
  constructor(
    protected builderConfig: builderConfig,
    protected config: UserConfig,
  ) {
    super("dev", builderConfig, config);
    this.config.root = this.builderConfig.root;
  }

  async routeRegistry() {
    return (await this.$server.ssrLoadModule(this.getSsrModule())).buildroutes;
  }

  async connectMws() {
    this.$app.use(this.base, this.$server.middlewares);
    this.$app.all(this.base + "*", async (req, res, next) => {
      if (req.originalUrl.includes(this.base)) {
        try {
          const url = req.originalUrl.replace(this.base, "/");
          let html = await this.render(url);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e) {
          Logger.log(e, "@devBuildError");
        }
      } else next();
    });
  }

  async build() {
    this.$server = await createViteServer(this.config);
    this.$render = (
      await this.$server.ssrLoadModule(this.getSsrModule())
    ).render;
    await this.connectMws();
  }

  async render(url) {
    try {

      this.$template = await this.$server.transformIndexHtml(
        url,
        this._template_,
      );
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
