<template>
  <aside class="w2-right" :class="{ 'w2-right--visible': hasItems }">
    <div class="w2-rp-header">
      <span class="material-symbols-rounded w2-rp-header-icon">format_list_bulleted</span>
      On this page
    </div>
    <nav class="w2-rp-nav">
      <template v-for="cat in subcats" :key="cat.to">
        <a
          class="w2-rp-item"
          :class="{ 'w2-rp-item--active': activeId === cat.to }"
          @click="go(cat)"
        >
          <span class="w2-rp-track">
            <span class="w2-rp-dot"></span>
          </span>
          <span class="w2-rp-label">{{ cat.label }}</span>
        </a>
        <template v-if="cat.group?.length > 0">
          <a
            v-for="item in cat.group"
            :key="item.to"
            class="w2-rp-item w2-rp-item--sub"
            :class="{ 'w2-rp-item--active': activeId === item.to }"
            @click="go(item)"
          >
            <span class="w2-rp-track">
              <span class="w2-rp-dot"></span>
            </span>
            <span class="w2-rp-label">{{ item.label }}</span>
          </a>
        </template>
      </template>
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

function go(target) {
  EventHandler.emit("hookto", target)
}
</script>
