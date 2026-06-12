<template>
  <div class="w2-shell">
    <search />
    <about-modal :open="showAbout" @close="showAbout = false" />

    <!-- Reading progress bar -->
    <div class="w2-progress-track">
      <div class="w2-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <div class="w2-topbar" :class="{ 'w2-topbar--scrolled': scrollY > 4 }">
      <div class="w2-topbar-left">
        <div class="w2-brand">
          <span class="w2-brand-dot"></span>
          <span class="w2-brand-name">chasi<em>.ts</em></span>
          <span class="w2-brand-tag">docs</span>
        </div>
        <span class="w2-breadcrumb">/ {{ controlStore.ctx.label || 'Introduction' }}</span>
      </div>
      <div class="w2-topbar-right">
        <button class="w2-search-btn" @click="controlStore.setModal(true)">
          <span class="material-symbols-rounded w2-search-icon">search</span>
          <span class="w2-search-placeholder">Search docs…</span>
          <kbd class="w2-search-kbd">⌘K</kbd>
        </button>
        <select
          class="w2-version-select"
          :value="controlStore.activeVersion"
          @change="controlStore.switchVersion($event.target.value)"
        >
          <option v-for="v in controlStore.availableVersions" :key="v" :value="v">v{{ v }}</option>
        </select>
        <!-- Theme switcher -->
        <div class="w2-theme-switcher">
          <button
            v-for="t in themes" :key="t.id"
            class="w2-theme-btn"
            :class="{ 'w2-theme-btn--active': theme === t.id }"
            :title="t.label"
            @click="setTheme(t.id)"
          >
            <span class="material-symbols-rounded">{{ t.icon }}</span>
          </button>
        </div>

        <a class="w2-gh-link" href="https://github.com/rocketbean/chasi-ts" target="_blank" rel="noreferrer">
          <span class="material-symbols-rounded">open_in_new</span>
          GitHub
        </a>

        <button class="w2-about-btn" @click="showAbout = true" title="About the author">
          <span class="material-symbols-rounded">account_circle</span>
        </button>
      </div>
    </div>

    <div class="w2-body">
      <aside class="w2-sidebar">
        <nav class="w2-nav">
          <a
            v-for="option in controlStore.left.navigation"
            :key="option.id"
            class="w2-nav-item"
            :class="{ 'w2-nav-item--active': controlStore.active.context.id === option.id }"
            @click="onNavClick(option.id)"
          >
            <span class="material-symbols-rounded w2-nav-icon">{{ option.icon || 'article' }}</span>
            <span class="w2-nav-label">{{ option.label }}</span>
          </a>
        </nav>
      </aside>

      <main class="w2-main" :class="{ 'w2-main--has-right': hasRightPanel }" ref="mainEl">
        <container />

        <!-- Scroll-to-top button -->
        <button v-if="showScrollTop" class="w2-scroll-top" @click="scrollToTop" title="Back to top">
          <span class="material-symbols-rounded">arrow_upward</span>
        </button>
      </main>

      <right-panel />
    </div>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import container from "@/pages/main/container.vue"
import search from "@/components/utils/search/search.vue"
import RightPanel from "@/components/right/RightPanel.vue"
import AboutModal from "@/components/utils/AboutModal.vue"
import { ref, computed, onMounted, onUnmounted } from "vue"

const controlStore = useControlStore()
controlStore.activate()

const mainEl = ref(null)
const scrollY = ref(0)
const scrollProgress = ref(0)
const showScrollTop = ref(false)
const hasRightPanel = computed(() => (controlStore.ctx?.subcats?.length ?? 0) > 0)

const themes = [
  { id: "dark",   icon: "dark_mode",  label: "Dark"   },
  { id: "light",  icon: "light_mode", label: "Light"  },
  { id: "accent", icon: "palette",    label: "Accent" },
  { id: "forest", icon: "forest",     label: "Forest" },
]
const theme = ref("dark")
const showAbout = ref(false)

function setTheme(t) {
  theme.value = t
  if (typeof window !== "undefined") {
    document.documentElement.setAttribute("data-theme", t)
    localStorage.setItem("w2-theme", t)
  }
}

function onScroll() {
  const el = mainEl.value
  if (!el) return
  scrollY.value = el.scrollTop
  showScrollTop.value = el.scrollTop > 300
  const max = el.scrollHeight - el.clientHeight
  scrollProgress.value = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0
}

function scrollToTop() {
  if (mainEl.value) mainEl.value.scrollTo({ top: 0, behavior: "smooth" })
}

function onNavClick(id) {
  controlStore.activate(id)
  scrollToTop()
}

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault()
    controlStore.toggleModal()
  }
}

onMounted(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("w2-theme") || "dark"
    setTheme(saved)
    window.addEventListener("keydown", onKeydown)
    if (mainEl.value) mainEl.value.addEventListener("scroll", onScroll, { passive: true })
  }
})
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onKeydown)
    if (mainEl.value) mainEl.value.removeEventListener("scroll", onScroll)
  }
})
</script>

<style>
@import "./assets/theme.css";
</style>
