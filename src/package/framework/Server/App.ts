import Express from "express";
import http from "http";
import https from "https";
import { serverConfig } from "../Interfaces.js";
import { networkInterfaces } from "os";

export default class App {
  $server: any = Express();
  server: any;
  env: string;
  mode: { [key: string]: any };
  protocol: any;
  constructor(public config: serverConfig) {
    this.config = config;
    this.setEnvironment();
  }

  setEnvironment() {
    this.mode = this.config.modes[this.config.environment];
    if (this.mode.protocol == "https") this.protocol = https;
    else this.protocol = http;
  }

  install() {
    this.server = this.protocol.createServer({}, this.$server);
  }

  async bootup() {}
}
