<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="apispec" /> {{ apispec.label }}</span>
        </div>
        <small><span class="subtitle">{{ apispec.text }}</span></small>
      </div>
    </section>

    <!-- Configuration = the fields of ApiSpecConfig (./src/config/apispec.ts) -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="apispecConfig" /> {{ config.label }}</span>
          <tag :name="'<ApiSpecConfig>'" type="ApiSpecConfig" inline />
        </div>
        <small><span class="subtitle">{{ config.sublabel }}</span></small>
      </div>
      <span class="sub-text">{{ config.text }}</span>
    </section>
    <list :items="configItems" />

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="apispecSchemas" /> {{ schemas.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ schemas.text }}</span>
    </section>
    <list :items="schemaItems" />
    <div class="schema-table sub-text">
      <p class="is-size-6 has-text-weight-semibold mb-2">Schema key formats by driver</p>
      <table class="table is-bordered is-striped is-narrow is-fullwidth">
        <thead>
          <tr>
            <th>Driver</th>
            <th>plain (default)</th>
            <th>prefixed</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>MongoDB</td><td>user</td><td>test:user</td></tr>
          <tr><td>Prisma</td><td>User</td><td>mysql:User</td></tr>
          <tr><td>Drizzle</td><td>properties</td><td>pg:properties</td></tr>
        </tbody>
      </table>
    </div>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="apispecRoutes" /> {{ routes.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ routes.text }}</span>
    </section>
    <list :items="routeItems" />

    <!-- Referenced types, isolated — reached by clicking a <ApiSpec…> tag above -->
    <section class="section" v-for="t in typeBlocks" :key="t.head.id">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook :id="t.head.id" /> <tag :name="t.head.label" :type="typeName(t.head.label)" inline /></span>
        </div>
        <small><span class="subtitle">referenced type</span></small>
      </div>
      <span class="sub-text">{{ t.head.text }}</span>
      <list :items="t.items" />
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="apispecExample" /> {{ example.label }}</span>
        </div>
      </div>
    </section>
    <code-container mapping="apispec/example" :options="codeOpts">
      <template #comment><p>{{ example.text }}</p></template>
    </code-container>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import hook from "@/components/utils/hook.vue"
import list from "@/components/utils/list/list.vue"
import codeContainer from "@/components/utils/codes/codeContainer.vue"
import tag from "@/components/utils/tag/tag.vue"

const store = useControlStore()
const codeOpts = { lang: "ts", theme: "vitesse-dark" }

const d = (id) => store.dict[id] ?? { id, label: id, text: "", sublabel: "", type: "" }
const typeName = (label) => (label || "").replace(/[<>]/g, "")
const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
// Map dictionary entries → <list> items (version-aware: unknown ids are dropped).
const toItems = (ids, parent) =>
  ids
    .filter((id) => store.dict[id])
    .map((id) => {
      const e = store.dict[id]
      const field = (e.label || "").replace(/\?$/, "")
      return { hook: e.id, title: e.label, sub: parent && e.type ? `[${parent}.${field}]` : "", tag: e.type || "", desc: esc(e.text) }
    })

const apispec = d("apispec")
const config  = d("apispecConfig")
const schemas = d("apispecSchemas")
const routes  = d("apispecRoutes")
const example = d("apispecExample")

const configItems = toItems(["asc-enabled", "asc-output", "asc-definition", "asc-components", "asc-security", "asc-schemas"], "ApiSpecConfig")
const schemaItems = toItems(["asm-keyformat", "asm-drivers", "asm-models"], "ApiSpecSchemaFilter")
const routeItems  = toItems(["asr-spec", "asr-security", "asr-tags", "asr-middlewares"])

// Isolated referenced-type lists (version-gated) — reached by clicking a <ApiSpec…> tag above.
const typeBlocks = [
  { head: d("asp-outputconfig"), items: toItems(["aoc-filename", "aoc-pretty"], "ApiSpecOutputConfig") },
  { head: d("asp-definition"),   items: toItems(["ad-openapi", "ad-info", "ad-servers"], "ApiSpecDefinition") },
  { head: d("asp-components"),   items: toItems(["ac-schemas", "ac-responses", "ac-parameters", "ac-securityschemes", "ac-requestbodies", "ac-headers", "ac-examples"], "ApiSpecComponents") },
  { head: d("asp-axisfilter"),   items: toItems(["aaf-include", "aaf-exclude"], "ApiSpecSchemaAxisFilter") },
].filter((t) => t.items.length)
</script>

<style scoped>
.sub-text { display: block; padding: 0 35px; }
.schema-table { overflow-x: auto; margin-top: 1rem; margin-bottom: 1rem; }
</style>
