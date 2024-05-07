<template>
<router-view v-slot="{ Component }" class="position-relative">
  <component :is="Component" />
</router-view>
</template>

<script lang = "ts">
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>