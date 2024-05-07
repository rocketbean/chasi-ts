<template>
  <div class = "main-page">
    <div class = "content glass" >
      <span class = "is-size-3">
        We're working on it 
      </span>
      <p class = "sub-text is-size-6">
        {{ ctx.label }} Documentation is on it's way, please check again soon.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore.js"
const control =  useControlStore()
const ctx = control.ctx
</script>

<style scoped>
.main-page {
  display: grid;
  height:100%;
  place-items: center;
}

.content {
  padding: 10px;
  border-radius: 10px;
  margin:150px;
}
</style>