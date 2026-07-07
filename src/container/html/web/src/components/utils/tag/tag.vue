<template>
  <a class="in-tag" :class="[props.inline ? 'inline-type' : 'tag', props.style, { 'is-type-tag': typeInfo && !props.inline, 'is-linked': props.to }]" @click="onClick" @mouseenter="onEnter" @mouseleave="onLeave">
    {{ props.name }}
    <Teleport to="body">
      <div v-if="show" ref="tipEl" class="tag-tip" :class="{ 'ts-hover': typeInfo }" :style="tipStyle" @mouseenter="cancelHide" @mouseleave="scheduleHide">
        <!-- VS Code style TypeScript tooltip (when the tag is a known type) -->
        <div v-if="typeInfo" class="ts-tip">
          <pre class="ts-code"><span class="ts-kw">type</span> <span class="ts-tname">{{ typeKey }}</span> <span class="ts-op">=</span> <template v-if="!typeInfo.properties"><span class="ts-lit">{{ typeInfo.signature }}</span></template><template v-else>{{ '{' }}
<template v-for="p in typeInfo.properties" :key="p.name">  <span class="ts-pname">{{ p.name }}</span><span class="ts-op">:</span> <span class="ts-tname">{{ p.type }}</span><span class="ts-op">;</span>
</template>{{ '}' }}</template></pre>
          <p class="ts-doc" v-if="typeInfo.text">{{ typeInfo.text }}</p>
          <div class="ts-props-doc" v-if="propDocs.length">
            <div v-for="p in propDocs" :key="p.name" class="ts-pd">
              <span class="ts-pname">{{ p.name }}</span> — {{ p.text }}
            </div>
          </div>
        </div>
        <!-- Glossary reference hover (existing behavior) -->
        <div class="content" v-else-if="data">
          <h1>{{ data.label }}</h1>
          <div v-if="data.reference">
            <a
              v-for="(rfr, i) in data.reference"
              class="tag in-tag"
              style="margin:2px"
              :key="i"
              > {{ rfr }}
            </a>
          </div>
          <inline-separator margin="none" />
          <p>{{ data.text }}</p>
        </div>
      </div>
    </Teleport>
  </a>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import { EventHandler } from "@/assets/event-handler"
import { ref, computed, nextTick } from "vue"
let ctx = useControlStore();
const data = ref(null);
const show = ref(false);
const tipEl = ref(null);
const tipStyle = ref({});
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  // when set (or when `name` matches a registered type), render the VS Code type tooltip
  type: {
    type: String
  },
  // render inline (no chip) — used for type refs inside a type expression
  inline: {
    type: Boolean,
    default: false
  },
  // hook id to scroll to on click (a type's definition list, etc.)
  to: {
    type: String
  },
  src: {
    type: String
  },
  style: {
    type: String
  }
})

const typeKey  = computed(() => props.type || props.name)
const typeInfo = computed(() => ctx.types?.[typeKey.value] || null)
const propDocs = computed(() => (typeInfo.value?.properties || []).filter((p) => p.text))

if (props.reference) {
  data.value = ctx.dict[props.reference]
}

const onClick = () => {
  if (props.to) EventHandler.emit("hookto", { to: props.to })
}

// The tooltip stays open while the pointer is on the trigger OR the tooltip itself — a short
// hide delay bridges the gap between them so it doesn't vanish as you move onto it.
let hideTimer = null
const cancelHide = () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null } }
const scheduleHide = () => { cancelHide(); hideTimer = setTimeout(() => { show.value = false }, 140) }

// Teleport the tooltip to <body> and auto-position it: prefer above the trigger, flip below
// if there's no room, and clamp horizontally so large tooltips never run off the viewport.
const onEnter = (e) => {
  if (!typeInfo.value && !data.value) return
  cancelHide()
  const rect = e.currentTarget.getBoundingClientRect()
  show.value = true
  tipStyle.value = { top: "0px", left: "0px", opacity: "0" }   // render off-screen to measure
  nextTick(() => {
    const el = tipEl.value
    if (!el) return
    const tw = el.offsetWidth
    const th = el.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const m = 8
    let left = rect.left
    if (left + tw > vw - m) left = Math.max(m, vw - tw - m)
    if (left < m) left = m
    let top = rect.top - th - 6                 // above the trigger
    if (top < m) top = Math.min(vh - th - m, rect.bottom + 6)   // no room → flip below
    tipStyle.value = { top: top + "px", left: left + "px", opacity: "1" }
  })
}
const onLeave = () => { scheduleHide() }
</script>

<style lang="scss" scoped>
  .in-tag { position: relative; }
  .is-linked { cursor: pointer; }
  /* inline type reference (inside a type expression) — subtle, hoverable */
  .inline-type {
    color: var(--w2-cyan);
    cursor: help;
    border-bottom: 1px dotted var(--w2-cyan);
    padding: 0;
  }
  .inline-type.is-linked { cursor: pointer; }
  /* type chip — monospace, subtle */
  .is-type-tag {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: var(--w2-bg-card);
    color: var(--w2-cyan);
    border: 1px solid var(--w2-border);
  }

  /* ── Teleported tooltip: viewport-fixed, sizes to content, clamped, theme-aware ── */
  .tag-tip {
    position: fixed;
    z-index: 99999;
    width: max-content;
    max-width: min(360px, 92vw);
    max-height: min(340px, 80vh);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    background: var(--w2-bg-card);
    border: 1px solid var(--w2-border);
    border-radius: 10px;
    box-shadow: var(--w2-shadow);
    color: var(--w2-text);
    text-align: start;
    word-wrap: break-word;
    transition: opacity 0.08s ease;
  }
  .tag-tip.ts-hover {
    width: max-content;
    max-width: min(560px, 92vw);
    max-height: min(380px, 80vh);
    padding: 0;
    background: var(--w2-bg-surface);
    border: 1px solid var(--w2-border);
  }
  .tag-tip h1 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; color: var(--w2-text); }
  .tag-tip p  { white-space: normal; color: var(--w2-text-muted); }

  /* ── TS type tooltip (syntax colors follow the theme) ─────────── */
  .ts-tip { text-align: left; }
  .ts-code {
    margin: 0;
    padding: 10px 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--w2-text);
    background: var(--w2-bg-card);
    white-space: pre-wrap;
    word-break: break-word;
    border-bottom: 1px solid var(--w2-border-faint);
  }
  .ts-kw    { color: var(--w2-blue); }
  .ts-tname { color: var(--w2-cyan); }
  .ts-pname { color: var(--w2-blue); }
  .ts-lit   { color: var(--w2-accent); }
  .ts-op    { color: var(--w2-text-muted); }
  .ts-doc {
    margin: 0;
    padding: 8px 12px;
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--w2-text);
    white-space: normal;
  }
  .ts-props-doc { padding: 0 12px 10px; }
  .ts-pd {
    font-size: 11px;
    line-height: 1.4;
    color: var(--w2-text-muted);
    white-space: normal;
    margin-top: 2px;
  }
  .ts-pd .ts-pname { color: var(--w2-blue); }
</style>
