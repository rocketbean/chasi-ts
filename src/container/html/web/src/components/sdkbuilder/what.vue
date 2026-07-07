<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="sdkbuilder" /> {{ sdkbuilder.label }}</span>
        </div>
        <small><span class="subtitle">{{ sdkbuilder.text }}</span></small>
      </div>
    </section>

    <!-- Configuration = the fields of one SdkBuilderOutput -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="sdkbuilderConfig" /> {{ config.label }}</span>
          <tag :name="'<SdkBuilderOutput>'" type="SdkBuilderOutput" inline />
        </div>
        <small><span class="subtitle">{{ config.sublabel }}</span></small>
      </div>
      <span class="sub-text">
        {{ config.text }} The config is <code>{ output: SdkBuilderOutput[] }</code> — one entry
        per SDK. <code>output</code> is the only top-level field; every field below is a field of
        each <code>SdkBuilderOutput</code>.
      </span>
    </section>
    <list :items="configItems" />
    <code-container mapping="sdkbuilder/config" :options="codeOpts">
      <template #comment><p>Two independent SDKs generated from one route set.</p></template>
      <template #notes>The typed .d.ts sidecar is written only by npm run build.</template>
    </code-container>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="sdkbuilderOutput" /> {{ output.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ output.text }}</span>
    </section>
    <list :items="outputItems" />
    <code-container mapping="sdkbuilder/formatter" :options="codeOpts">
      <template #comment><p>Swap the formatter per output — or omit it for raw output.</p></template>
    </code-container>

    <!-- Referenced types, each its own list — reached by clicking the type in a tag above -->
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
          <span><hook id="sdkbuilderSdk" /> {{ sdkMethod.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ sdkMethod.text }}</span>
    </section>
    <list :items="sdkItems" />
    <code-container mapping="sdkbuilder/sdk" :options="codeOpts">
      <template #comment><p>Validation handlers run at build time and are serialized into the bundle.</p></template>
    </code-container>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="sdkbuilderGenerated" /> {{ generated.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ generated.text }}</span>
    </section>
    <list :items="genItems" />

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="sdkbuilderExample" /> {{ example.label }}</span>
        </div>
      </div>
    </section>
    <code-container mapping="sdkbuilder/consumer" :options="codeOpts">
      <template #comment><p>Consuming the generated bundle in a frontend app.</p></template>
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

const sdkbuilder = d("sdkbuilder")
const config     = d("sdkbuilderConfig")
const output     = d("sdkbuilderOutput")
const sdkMethod  = d("sdkbuilderSdk")
const generated  = d("sdkbuilderGenerated")
const example    = d("sdkbuilderExample")

const configItems = toItems(["sdb-output", "sdb-namespace", "sdb-enabled", "sdb-host", "sdb-routers", "sdb-httpClient", "sdb-exclude", "sdb-typed"], "output[]")
const outputItems = toItems(["sdb-filename", "sdb-formatter", "sdb-terser"], "SdkBuilderOutput")
const sdkItems    = toItems(["sdb-sdk-method", "sdb-sdk-array", "sdb-sdk-chain", "sdb-sdk-group", "sdb-sdk-router"])
const genItems    = toItems(["sdb-gen-structure", "sdb-gen-validate", "sdb-gen-request", "sdb-gen-runsdk"])

// Isolated referenced-type lists (skipped on versions that lack them).
const typeBlocks = [
  { head: d("sdb-selector"),   items: toItems(["sel-router", "sel-namespace", "sel-filter", "sel-naming"], "SdkRouterSelector") },
  { head: d("sdb-exceptions"), items: toItems(["exc-url", "exc-m"], "RouteExceptions") },
  { head: d("sdb-typedef"),    items: toItems(["ty-enabled", "sdb-emit", "sdb-typeModule", "sdb-build"], "SdkBuilderTyped") },
].filter((t) => t.items.length)
</script>

<style scoped>
.sub-text { display: block; padding: 0 35px; }
</style>
