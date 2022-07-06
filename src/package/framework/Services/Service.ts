import { BootableInterface, ServiceProviderInterface } from "../Interfaces.js";

export default class Service
  implements BootableInterface, ServiceProviderInterface
{
  service: ServiceProviderInterface;
  private status: "loaded" | "booted" = "loaded";
  constructor(public name: string, public instance: any) {
    this.name = name;
    this.instance = new instance();
  }

  async boot() {
    this.service = await this.instance.boot();
    this.status = "booted";
  }
}
