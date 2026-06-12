<template>
  <div class="main-content" style="width:100%;">
    <transition name="section" mode="out-in">
      <div v-if="ctx.id === 'intro'" :key="ctx.id" class="bottom-padding">
        <intro />
      </div>
      <div v-else-if="ctx.id === 'install'" :key="ctx.id" class="bottom-padding">
        <installation />
      </div>
      <div v-else-if="ctx.id === 'server'" :key="ctx.id" class="bottom-padding">
        <server />
      </div>
      <div v-else-if="ctx.id === 'router'" :key="ctx.id" class="bottom-padding">
        <router />
      </div>
      <div v-else-if="ctx.id === 'controller'" :key="ctx.id" class="bottom-padding">
        <controller />
      </div>
      <div v-else-if="ctx.id === 'database'" :key="ctx.id" class="bottom-padding">
        <database />
      </div>
      <div v-else-if="ctx.id === 'testing'" :key="ctx.id" class="bottom-padding">
        <testing />
      </div>
      <div v-else-if="ctx.id === 'observer'" :key="ctx.id" class="bottom-padding">
        <observer />
      </div>
      <div v-else-if="ctx.id === 'apispec'" :key="ctx.id" class="bottom-padding">
        <apispec />
      </div>
      <div v-else-if="ctx.id === 'sdkbuilder'" :key="ctx.id" class="bottom-padding">
        <sdkbuilder />
      </div>
      <div v-else-if="ctx.id === 'compilerEngine'" :key="ctx.id" class="bottom-padding">
        <compilerengine />
      </div>
      <div v-else :key="'catcher'" style="width:100%; height:100%;">
        <catcher />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore.js"
import intro from "./intro.vue"
import installation from "./installation.vue"
import server from "./server.vue"
import router from "./router.vue"
import controller from "./controller.vue"
import database from "./database.vue"
import catcher from "./catcher.vue"
import testing from "./testing.vue"
import observer from "./observer.vue"
import apispec from "./apispec.vue"
import sdkbuilder from "./sdkbuilder.vue"
import compilerengine from "./compilerengine.vue"
import { computed } from "vue"

const controlStore = useControlStore()
controlStore.activate()

const ctx = computed(() => controlStore.ctx)
</script>

<style>
.main-content { min-width: 100%; width: 100%; }
.bottom-padding { padding-bottom: 500px; }
</style>
