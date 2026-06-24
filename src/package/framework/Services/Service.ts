import { BootableInterface, ServiceProviderInterface } from "../Interfaces.js";

export default class Service
  implements BootableInterface, ServiceProviderInterface
{
  service: ServiceProviderInterface;
  constructor(public name: string, public instance: any) {
    this.name = name;
    this.instance = new instance();
  }

  async boot() {
    this.service = await this.instance.boot();
  }
}
