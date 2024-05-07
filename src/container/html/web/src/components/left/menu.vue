<template>
  <nav class="panel glass">
    <p class="panel-heading has-background-dark is-size-6"> basics[v:2.3.5]</p>
    <a class="panel-block is-active" :class="controlStore.active.context.id == option.id ? 'gradient-background' : ''"
      v-for="option in controlStore.left.navigation" :key = "option.id" @click="controlStore.activate(option.id)">
      <span class="material-symbols-rounded" style="padding-right: 11px; font-weight: 500; ">
        {{ option.icon }}
      </span>
      {{ option.label }}
    </a>
  </nav>
</template>

<script setup >
import { useControlStore } from "@/stores/ControlStore";
const controlStore = useControlStore()

</script>

<style scoped>
.panel-block:last-child {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.material-symbols-rounded{
  font-size: 20px !important;
}
</style>