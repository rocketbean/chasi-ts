<template>
  <div class="main-content" style="width:100%;">
    <transition name="slide-left" >
      <div v-if="ctx.id === 'intro'" class = "bottom-padding">
        <intro />
      </div>
      <div v-else-if="ctx.id === 'install'" class = "bottom-padding">
        <installation />
      </div>
      <div v-else-if="ctx.id === 'server'" class = "bottom-padding">
        <server />
      </div>
      <div v-else-if="ctx.id === 'router'" class = "bottom-padding">
        <router />
      </div>
      <div v-else-if="ctx.id === 'controller'" class = "bottom-padding">
        <controller />
      </div>
      <div v-else-if="ctx.id === 'database'" class = "bottom-padding">
        <database />
      </div>

      <div v-else style="width:100%; height: 100%; ">
        <catcher/>
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
import { useControlStore } from "@/stores/ControlStore.js"
import intro from "./intro.vue"
import installation from "./installation.vue";
import server from "./server.vue";
import router from "./router.vue";
import controller from "./controller.vue";
import database from "./database.vue";
import catcher from "./catcher.vue";
import { computed, onMounted } from "vue";

const controlStore = useControlStore()
controlStore.activate()


const ctx = computed(() => {
  return controlStore.ctx
})

onMounted(() => {

})
</script>

<style>
.main-content {
  min-width: 100%;
  width: 100%;
  overflow-x: hidden;
}

.bottom-padding {
  padding-bottom: 500px;
}
</style>