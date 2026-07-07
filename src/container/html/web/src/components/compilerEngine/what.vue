<template>
  <div>
    <!-- ── Overview ─────────────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="compilerEngine" /> {{ ce.label }}</span>
        </div>
        <small><span class="subtitle">{{ ce.sublabel }}</span></small>
      </div>
      <span class="sub-text">{{ ce.text }}</span>
    </section>

    <!-- ── CompilerEngineConfig — the compiler config object ────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="compilerEngineConfig" /> {{ ceConfig.label }}</span>
          <span class="tag is-info is-light is-medium">&lt;CompilerEngineConfig&gt;</span>
        </div>
        <small><span class="subtitle">{{ ceConfig.sublabel }}</span></small>
      </div>
      <span class="sub-text">{{ ceConfig.text }}</span>
    </section>
    <list :items="configItems" />

    <!-- ── builderConfig — isolated engine-entry type (referenced by engines[]) ── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="builderConfig" /> {{ bcConfig.label }}</span>
          <span class="tag is-warning is-light is-medium">&lt;builderConfig&gt;</span>
        </div>
        <small><span class="subtitle">referenced type · {{ bcConfig.sublabel }}</span></small>
      </div>
      <span class="sub-text">{{ bcConfig.text }}</span>
    </section>
    <list :items="builderItems" />

    <!-- ── ssr.config.js — function form required ───────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="ce-ssrconfig" /> {{ ssrConfig.label }}</span>
        </div>
        <small><span class="subtitle">{{ ssrConfig.sublabel }}</span></small>
      </div>
      <span class="sub-text">{{ ssrConfig.text }}</span>
    </section>

    <!-- ── Dev / Prod Modes ─────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="ce-modes" /> {{ modes.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ modes.text }}</span>
    </section>
    <list :items="modeItems" />

    <!-- ── CompilerEngine + serviceCluster ──────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="ce-cluster" /> {{ cluster.label }}</span>
        </div>
      </div>
      <span class="sub-text">{{ cluster.text }}</span>
    </section>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import hook from "@/components/utils/hook.vue"
import list from "@/components/utils/list/list.vue"

const store = useControlStore()

const d = (id) => store.dict[id] ?? { id, label: id, text: "", sublabel: "", type: "" }
const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
// Map dictionary entries → <list> items (version-aware: unknown ids are dropped).
const toItems = (ids, parent) =>
  ids
    .filter((id) => store.dict[id])
    .map((id) => {
      const e = store.dict[id]
      const field = (e.label || "").replace(/\?$/, "")
      return { hook: e.id, title: e.label, sub: parent ? `[${parent}.${field}]` : "", tag: e.type || "", desc: esc(e.text) }
    })

const ce        = d("compilerEngine")
const ceConfig  = d("compilerEngineConfig")
const bcConfig  = d("builderConfig")
const ssrConfig = d("ce-ssrconfig")
const modes     = d("ce-modes")
const cluster   = d("ce-cluster")

const configItems  = toItems(["ce-enabled", "ce-engines"], "CompilerEngineConfig")
const builderItems = toItems(["bc-name", "bc-environment", "bc-root", "bc-ssrServerModule", "bc-serverBuild", "bc-clientBuild", "bc-configPath", "bc-mountedTo", "bc-hook"], "builderConfig")
const modeItems    = toItems(["ce-dev", "ce-prod"])
</script>

<style scoped>
.sub-text { display: block; padding: 0 35px; }
</style>
