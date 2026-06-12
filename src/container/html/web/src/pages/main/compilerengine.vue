<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style="display:grid; place-items: center; width: 70px">
          <span class="material-symbols-rounded is-size-1" style="border:3px solid white; border-radius: 50%;">
            code_blocks
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Compiler Engine</p>
          <p class="subtitle">Vite <strong>SSR</strong> integration for Chasi</p>
        </div>
      </div>
    </div>
    <div class="content">
      <compiler-engine-what />
    </div>
  </div>
</template>

<script>
import compilerEngineWhat from "@/components/compilerEngine/what.vue"

export default {
  components: { compilerEngineWhat }
}
</script>

<style lang="scss" scoped></style>
