import Base from "../../Base.js";
import Service from "./Service.js";
import Provider from "./Provider.js";
import {
  ModuleInterface,
} from "../Interfaces.js";

export default class ServicesModule extends Base implements ModuleInterface {
  /***
   * [$services] App services
   * Out of the box Chasi Services;
   */
  $container: { [key: string]: Service } = {};

  constructor(public services: any) {
    super();
    this.services = services;
  }

  async installServices() {
    let _s = {};
    Object.keys(this.$container).map((service: string) => {
      _s[this.$container[service].name] = this.$container[service].service;
    });
    return _s;
  }

  async bootServices() {
    return Promise.all(
      Object.keys(this.services).map(async (service) => {
        this.$container[service] = new Service(
          service,
          await this.fetchFile(this.services[service]),
        );
        await this.$container[service].boot();
      }),
    );
  }

  static async init(services: any): Promise<ServicesModule> {
    Provider.init();
    let module = new ServicesModule(services);
    await module.bootServices();
    return module;
  }
}
