<template>
  <nav class="panel glass">
    <p class="panel-heading has-background-dark is-size-6">basics</p>

    <!-- version switcher -->
    <div class="version-bar">
      <span class="version-label">version</span>
      <select
        class="version-select"
        :value="controlStore.activeVersion"
        @change="controlStore.switchVersion($event.target.value)"
      >
        <option
          v-for="v in controlStore.availableVersions"
          :key="v"
          :value="v"
        >
          v{{ v }}
        </option>
      </select>
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

.version-select {
  flex: 1;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  appearance: auto;
  outline: none;
}

.version-select:focus {
  border-color: rgba(150, 140, 220, 0.6);
}
</style>
