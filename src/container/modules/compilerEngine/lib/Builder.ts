import { UserConfig } from "vite";
import { Express } from "express";
import devBundler from "./devBundler.js";
import prodBundler from "./prodBundler.js";
import { pathToFileURL } from "url";
import { builderConfig } from "../compiler.js";
import { BundlerInterface } from "./Bundler.js";
import { exit } from "process";
import fs from "fs";
import path from "path";

export interface BuilderInterface {
  $app: Express;
  $server: any;
  name: string;

  setup();
}

export default class Builder implements BuilderInterface {
  /*** $server
   * Vite static compiled ||
   * createServer =>createViteServer instance
   */
  public $server;
  public name: string;
  public bundler: BundlerInterface;

  constructor(public $app: Express, protected config: builderConfig) {
    this.name = this.config.name;
  }

  static async getConfigs(config): Promise<any> {
    return (
      await import(pathToFileURL(config.configPath).href)
    ).default() as UserConfig;
  }

  async setup(): Promise<Builder> {
    let builderConfig = (await Builder.getConfigs(this.config)) as UserConfig;
    if (this.config.environment !== "dev") {
      this.bundler = new prodBundler(this.config, builderConfig);
    } else {
      this.bundler = new devBundler(this.config, builderConfig);
    }
    return this;
  }

  static async prodSetup(
    getConfig: Function,
    ctx: builderConfig,
  ): Promise<void> {
    let conf = getConfig("compiler");
    if (conf.enabled && !__testMode()) {
      try {
        if (ctx.environment !== "dev") {
          let builderConfig = (await Builder.getConfigs(ctx)) as UserConfig;
          await prodBundler.clientBuild(ctx, builderConfig);
          await prodBundler.serverBuild(ctx, builderConfig);
          await Builder.sanitize(ctx)
        }
      } catch (e) {
        console.log(e);
        exit();
      }
    }
  }

  static async sanitize(ctx): Promise<void> {
    let common = ctx.root.replace(___location, "");
    let rootpath = path.join(___location, common);
    fs.rmSync(path.join(rootpath, "src"), { recursive: true, force: true });
    fs.rmSync(path.join(rootpath, "temp"), { recursive: true, force: true });
  }

  /**
   * distributes the build
   * specifically to [__devDirname]
   * if not on testMode.
   * as testMode runs 
   * already in /src dir
   * @param root dirpath
   */
  static async distribute(root): Promise<void> {
    if(!__testMode()) {
      let common = root.replace(___location, "");
      let rootpath = pathToFileURL(path.join(__devDirname, common)).href;
      try {
        fs.cpSync(path.join(__devDirname, common), root, { recursive: true });
      } catch (err) {
        throw err;
      }
    }
  }
}
