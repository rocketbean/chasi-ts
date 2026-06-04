import SchemaCollection from "./collections/Schemas.js";
import RouterCollection from "./collections/Routers.js";
import Compiler from "./Compiler.js";
import type { ApiSpecConfig, ApiSpecDocument } from "./ApiSpec.types.js";

// ─── ApiSpec ──────────────────────────────────────────────────────────────────

export default class ApiSpec {
  public schemas: SchemaCollection;
  public routers: RouterCollection;
  public compiler: Compiler;
  public static instance: ApiSpec;

  private constructor(private readonly config: ApiSpecConfig) {
    this.schemas = new SchemaCollection();
    this.routers = new RouterCollection();
  }

  static getInstance(): ApiSpec | undefined {
    return ApiSpec.instance;
  }

  static async init(config: ApiSpecConfig): Promise<ApiSpec> {
    ApiSpec.instance = new ApiSpec(config);
    await ApiSpec.instance.schemas.init(config.schemas);
    await ApiSpec.instance.routers.init(config);
    ApiSpec.instance.compiler = new Compiler(
      config,
      ApiSpec.instance.schemas,
      ApiSpec.instance.routers
    );
    return ApiSpec.instance;
  }

  /**
   * Assembles the OpenAPI document and writes it to the configured output file.
   * No-ops when `config.enabled` is false (guarded by the service provider).
   */
  async compile(): Promise<ApiSpecDocument> {
    const doc = this.compiler.compile();
    await this.compiler.write(doc);
    return doc;
  }
}
