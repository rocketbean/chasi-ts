<template>
  <aside class="w2-right" :class="{ 'w2-right--visible': hasItems }">
    <div class="w2-rp-header">
      <span class="material-symbols-rounded w2-rp-header-icon">format_list_bulleted</span>
      On this page
    </div>
    <nav class="w2-rp-nav">
      <button
        v-for="(r, i) in rows"
        :key="i"
        type="button"
        class="w2-rp-item"
        :class="{
          'w2-rp-item--sub': r.kind === 'item',
          'w2-rp-item--active': activeId === r.to,
          'w2-rp-connect': r.connect
        }"
        :style="r.kind === 'item' ? { paddingLeft: (10 + graduated(r.depth)) + 'px' } : {}"
        @click="go(r)"
      >
        <span class="w2-rp-track">
          <span v-if="r.kind === 'cat' && r.icon" class="material-symbols-rounded w2-rp-icon">{{ r.icon }}</span>
          <span v-else class="w2-rp-dot"></span>
        </span>
        <span class="w2-rp-label">{{ r.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import { EventHandler } from "@/assets/event-handler"
import { computed } from "vue"

const store  = useControlStore()
const subcats  = computed(() => store.ctx?.subcats ?? [])
const activeId = computed(() => store.scr?.target?.id ?? "")
const hasItems = computed(() => subcats.value?.length > 0)

// Graduated indentation: the first level is the biggest step, each deeper level a
// slightly smaller step (cumulative px) — keeps nesting legible without runaway indent.
const STEPS = [0, 18, 32, 43, 51]
const graduated = (depth) => STEPS[Math.min(depth, STEPS.length - 1)]

// Flatten cats + their group items, then flag which rows draw a vertical connector to the
// next. Rule: join an item to the next ONLY when the next is a same-depth item (a sibling).
// Section headers (cats) never connect; a lone item at its level — or the last of a group —
// has no same-depth neighbour, so no line; connectors never cross depth levels.
const rows = computed(() => {
  const out = []
  for (const cat of subcats.value) {
    out.push({ kind: "cat", to: cat.to, label: cat.label, icon: cat.icon })
    for (const item of (cat.group || [])) {
      out.push({ kind: "item", to: item.to, label: item.label, depth: item.depth || 0 })
    }
  }
  for (let i = 0; i < out.length; i++) {
    const r = out[i]
    const n = out[i + 1]
    r.connect = r.kind === "item" && !!n && n.kind === "item" && n.depth === r.depth
  }
  return out
})

function go(target) {
  EventHandler.emit("hookto", { to: target.to })
}
</script>
