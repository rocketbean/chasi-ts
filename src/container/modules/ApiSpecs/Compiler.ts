import fs from "fs";
import path from "path";
import type {
  ApiSpecConfig,
  ApiSpecDocument,
} from "./ApiSpec.types.js";
import SchemaCollection from "./collections/Schemas.js";
import RouterCollection from "./collections/Routers.js";

// ─── Compiler ────────────────────────────────────────────────────────────────

export default class Compiler {
  constructor(
    private readonly config: ApiSpecConfig,
    private readonly schemas: SchemaCollection,
    private readonly routers: RouterCollection
  ) {}

  // ─── Spec assembly ─────────────────────────────────────────────────────────

  compile(): ApiSpecDocument {
    const { definition, components: userComponents, security } = this.config;

    const doc: ApiSpecDocument = {
      openapi: definition.openapi,
      info: definition.info,
      paths: {},
    };

    if (definition.servers?.length) {
      doc.servers = definition.servers;
    }

    // ── Components ──────────────────────────────────────────────────────────
    // Start with auto-collected model schemas, then overlay user-defined ones.
    const assembledComponents: Record<string, unknown> = {};

    const modelSchemas = this.schemas.toOpenApiSchemas(this.config.schemas?.keyFormat);
    const customSchemas = userComponents?.schemas ?? {};
    const mergedSchemas = { ...modelSchemas, ...customSchemas };
    if (Object.keys(mergedSchemas).length) {
      assembledComponents.schemas = mergedSchemas;
    }

    if (userComponents?.securitySchemes) {
      assembledComponents.securitySchemes = userComponents.securitySchemes;
    }
    if (userComponents?.responses) {
      assembledComponents.responses = userComponents.responses;
    }
    if (userComponents?.parameters) {
      assembledComponents.parameters = userComponents.parameters;
    }
    if (userComponents?.requestBodies) {
      assembledComponents.requestBodies = userComponents.requestBodies;
    }
    if (userComponents?.headers) {
      assembledComponents.headers = userComponents.headers;
    }
    if (userComponents?.examples) {
      assembledComponents.examples = userComponents.examples;
    }

    if (Object.keys(assembledComponents).length) {
      doc.components = assembledComponents;
    }

    // ── Global security ─────────────────────────────────────────────────────
    if (security?.length) {
      doc.security = security;
    }

    // ── Paths ───────────────────────────────────────────────────────────────
    doc.paths = this.routers.collections;

    return doc;
  }

  // ─── File writer ───────────────────────────────────────────────────────────

  async write(doc: ApiSpecDocument): Promise<void> {
    const { filename, pretty = true } = this.config.output;
    const content = pretty
      ? JSON.stringify(doc, null, 2)
      : JSON.stringify(doc);

    // Resolve relative to project root (CWD at server start time)
    const outPath = path.resolve(process.cwd(), filename);

    try {
      await fs.promises.writeFile(outPath, content, "utf-8");
      Logger.log(`[ApiSpec] spec written → ${filename}`);
    } catch (err) {
      Logger.log(`[ApiSpec] failed to write spec: ${err}`);
    }
  }
}
