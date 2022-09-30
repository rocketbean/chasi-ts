import { UserConfig } from "vite";
import { Express } from "express";
import devBundler from "./devBundler.js";
import prodBundler from "./prodBundler.js";
import { pathToFileURL } from "url";
import { builderConfig } from "../compiler.js";
import { BundlerInterface } from "./Bundler.js";
import { exit } from "process";
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

  static async prodSetup(getConfig, ctx) {
    try {
      if (ctx.environment !== "dev") {
        let builderConfig = (await Builder.getConfigs(ctx)) as UserConfig;
        await prodBundler.clientBuild(ctx, builderConfig);
        await prodBundler.serverBuild(ctx, builderConfig);
      }
    } catch (e) {
      console.log(e);
      exit();
    }
  }
}
