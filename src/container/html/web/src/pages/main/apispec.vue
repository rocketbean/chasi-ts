<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style="display:grid; place-items: center; width: 70px">
          <span class="material-symbols-rounded is-size-1" style="border:3px solid white; border-radius: 50%;">
            description
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">API Spec</p>
          <p class="subtitle">automatic <strong>OpenAPI 3.x</strong> spec generation</p>
        </div>
      </div>
    </div>
    <div class="content">
      <apispec-what />
    </div>
  </div>
</template>

<script>
import apispecWhat from "@/components/apispec/what.vue"

export default {
  components: { apispecWhat }
}
</script>

<style lang="scss" scoped></style>
