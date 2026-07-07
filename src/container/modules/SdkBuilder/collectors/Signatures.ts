import ts from "typescript";
import fs from "fs";
import path from "path";
import type Endpoint from "../../../../package/framework/Router/Endpoint.js";
import type { SdkBuilderTyped } from "../SdkBuilder.types.js";

/**
 * Build-time-only signature parser for the typed SDK.
 *
 * Syntactically parses controller source with `ts.createSourceFile` (NO
 * Program/type-checker) to recover request/response FQNs. This module statically
 * imports `typescript`, so the collector must `import()` it **dynamically and
 * only in build mode** — that keeps `typescript` (a devDependency) off the
 * server-boot runtime path.
 */
type ControllerInfo = {
  /** methodName → first-parameter type text (undefined when the param is untyped). */
  methods: Map<string, string | undefined>;
  /** identifiers imported from the typeModule barrel (valid leading namespaces). */
  barrels: Set<string>;
};

export default class Signatures {
  private static _typeIndex = new Map<string, Map<string, Set<string>>>();
  private static _typeSource = new Map<string, Map<string, string>>();
  private static _controllers = new Map<string, ControllerInfo | null>();

  /** Clear caches — call once at the start of each build run. */
  static reset(): void {
    Signatures._typeIndex.clear();
    Signatures._typeSource.clear();
    Signatures._controllers.clear();
  }

  /**
   * Capture the verbatim declaration text of every `declare module
   * "<typeModule>/<Seg>"` under `typesRoot` → `Map<Seg, bodyText>`. Used by the
   * Compiler's `emit: "inline"` mode to copy the referenced types into the
   * generated `.d.ts` so the artifact is self-contained. Cached per (root, module).
   */
  static loadTypeSource(typesRoot: string, typeModule: string): Map<string, string> {
    const key = `${typesRoot}::${typeModule}`;
    const hit = Signatures._typeSource.get(key);
    if (hit) return hit;

    const out = new Map<string, string>();
    const prefix = `${typeModule}/`;
    for (const file of Signatures._walkDts(typesRoot)) {
      try {
        const src = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
        src.forEachChild((node) => {
          if (!ts.isModuleDeclaration(node) || !ts.isStringLiteral(node.name)) return;
          const mod = node.name.text;
          if (!mod.startsWith(prefix)) return;
          if (!node.body || !ts.isModuleBlock(node.body)) return;
          const seg = mod.slice(prefix.length);
          const text = node.body.statements.map((s) => s.getText(src)).join("\n");
          out.set(seg, out.has(seg) ? `${out.get(seg)}\n${text}` : text);
        });
      } catch {
        /* skip unreadable / unparseable file */
      }
    }
    Signatures._typeSource.set(key, out);
    return out;
  }

  /**
   * Index every `export type <Name>` inside `declare module "<typeModule>/<Seg>"`
   * across the `.d.ts` files under `typesRoot` → `Map<Seg, Set<name>>`. Used to
   * verify a `*Response` sibling actually exists. Cached per (typesRoot, module).
   */
  static loadTypeIndex(typesRoot: string, typeModule: string): Map<string, Set<string>> {
    const key = `${typesRoot}::${typeModule}`;
    const hit = Signatures._typeIndex.get(key);
    if (hit) return hit;

    const index = new Map<string, Set<string>>();
    const prefix = `${typeModule}/`;
    for (const file of Signatures._walkDts(typesRoot)) {
      try {
        const src = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, false);
        src.forEachChild((node) => {
          if (!ts.isModuleDeclaration(node) || !ts.isStringLiteral(node.name)) return;
          const mod = node.name.text; // e.g. "Chasi/Http/v2/Organisation"
          if (!mod.startsWith(prefix)) return;
          const seg = mod.slice(prefix.length);
          const names = index.get(seg) ?? new Set<string>();
          node.body?.forEachChild((decl) => {
            if (ts.isTypeAliasDeclaration(decl) && Signatures._isExported(decl)) {
              names.add(decl.name.text);
            }
          });
          index.set(seg, names);
        });
      } catch {
        /* skip unreadable / unparseable file */
      }
    }
    Signatures._typeIndex.set(key, index);
    return index;
  }

  /**
   * Parse a controller file: each `export default class` method (or arrow-fn
   * property) → its first-parameter type text, plus the identifiers imported
   * from `typeModule`. Cached per file.
   */
  static parseController(filePath: string, typeModule: string): ControllerInfo | null {
    if (Signatures._controllers.has(filePath)) return Signatures._controllers.get(filePath)!;
    let info: ControllerInfo | null = null;
    try {
      const src = ts.createSourceFile(filePath, fs.readFileSync(filePath, "utf8"), ts.ScriptTarget.Latest, true);
      const methods = new Map<string, string | undefined>();
      const barrels = new Set<string>();

      src.forEachChild((node) => {
        // imports from the barrel module → collect leading namespace identifiers
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === typeModule
        ) {
          const clause = node.importClause;
          if (clause?.name) barrels.add(clause.name.text);
          const nb = clause?.namedBindings;
          if (nb && ts.isNamespaceImport(nb)) barrels.add(nb.name.text);
          if (nb && ts.isNamedImports(nb)) nb.elements.forEach((e) => barrels.add(e.name.text));
        }

        // export default class → methods' first-parameter types
        if (ts.isClassDeclaration(node) && Signatures._isDefaultExport(node)) {
          node.members.forEach((m) => {
            let name: ts.PropertyName | undefined;
            let firstParamType: string | undefined;
            if (ts.isMethodDeclaration(m) && m.name) {
              name = m.name;
              firstParamType = m.parameters[0]?.type?.getText(src);
            } else if (
              ts.isPropertyDeclaration(m) &&
              m.name &&
              m.initializer &&
              (ts.isArrowFunction(m.initializer) || ts.isFunctionExpression(m.initializer))
            ) {
              name = m.name;
              firstParamType = m.initializer.parameters[0]?.type?.getText(src);
            }
            if (name && ts.isIdentifier(name)) methods.set(name.text, firstParamType);
          });
        }
      });

      info = { methods, barrels };
    } catch {
      info = null;
    }
    Signatures._controllers.set(filePath, info);
    return info;
  }

  /**
   * Resolve `{ req, res }` FQNs for an endpoint's controller method. Returns `{}`
   * (→ fallback types) on any miss: function-bound route, missing file, untyped
   * param, non-barrel type, or (for `res`) no verified `*Response` sibling.
   */
  static resolve(ep: Endpoint, method: string, typed: SdkBuilderTyped): { req?: string; res?: string } {
    try {
      const typeModule = typed.typeModule ?? "Chasi/Http/v2";
      const sourceRoot = typed.sourceRoot ?? path.join(process.cwd(), "src");
      const controllerDir = "container/controllers";
      const binding = ep.controller; // e.g. "v1/UserController" (includes subdir)
      if (!binding || binding === "Function") return {};

      const file = path.join(sourceRoot, controllerDir, `${binding}.ts`);
      const ctrl = Signatures.parseController(file, typeModule);
      const paramType = ctrl?.methods.get(method);
      if (!ctrl || !paramType) return {};

      // request: only trust a type whose leading identifier is a barrel namespace
      const leadId = paramType.split(/[.<[\s]/)[0];
      if (!ctrl.barrels.has(leadId)) return {};
      const req = paramType;

      // response (auto): <Ns>.<X>Request → <Ns>.<X>Response, verified in the index
      let res: string | undefined;
      if ((typed.responseStrategy ?? "auto") === "auto") {
        const m = paramType.match(/^([A-Za-z0-9_$]+)\.([A-Za-z0-9_$]*)Request$/);
        if (m) {
          const seg = m[1];
          const resName = `${m[2]}Response`;
          const typesRoot = path.resolve(process.cwd(), typed.typesRoot ?? "src/types/http/v2");
          if (Signatures.loadTypeIndex(typesRoot, typeModule).get(seg)?.has(resName)) {
            res = `${seg}.${resName}`;
          }
        }
      }

      return { req, res };
    } catch {
      return {};
    }
  }

  // ─── helpers ─────────────────────────────────────────────────────────────────
  private static _walkDts(dir: string): string[] {
    const out: string[] = [];
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...Signatures._walkDts(p));
        else if (entry.name.endsWith(".d.ts")) out.push(p);
      }
    } catch {
      /* directory absent — empty index */
    }
    return out;
  }

  private static _isExported(node: ts.Declaration): boolean {
    return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
  }

  private static _isDefaultExport(node: ts.ClassDeclaration): boolean {
    const flags = ts.getCombinedModifierFlags(node);
    return (flags & ts.ModifierFlags.Export) !== 0 && (flags & ts.ModifierFlags.Default) !== 0;
  }
}
