<template>
  <nav class="panel glass">
    <p class="panel-heading has-background-dark is-size-6">basics</p>

    <!-- version switcher -->
    <div class="version-bar">
      <span class="version-label">version</span>
      <div class="version-buttons">
        <button
          v-for="v in controlStore.availableVersions"
          :key="v"
          class="version-btn"
          :class="{ active: controlStore.activeVersion === v }"
          @click="controlStore.switchVersion(v)"
        >
          v{{ v }}
        </button>
      </div>
    </div>

    <a class="panel-block is-active" :class="controlStore.active.context.id == option.id ? 'gradient-background' : ''"
      v-for="option in controlStore.left.navigation" :key="option.id" @click="controlStore.activate(option.id)">
      <span class="material-symbols-rounded" style="padding-right: 11px; font-weight: 500;">
        {{ option.icon }}
      </span>
      {{ option.label }}
    </a>
  </nav>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore";
const controlStore = useControlStore()
</script>

<style scoped>
.panel-block:last-child {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.material-symbols-rounded {
  font-size: 20px !important;
}

.version-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.version-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.version-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.version-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.15s ease;
}

.version-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

.version-btn.active {
  background: rgba(72, 66, 118, 0.7);
  border-color: rgba(150, 140, 220, 0.6);
  color: #fff;
}
</style>
