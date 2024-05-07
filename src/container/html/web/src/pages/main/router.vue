<template>
  <div class = "">
    <div class="hero is-small is-dark">
      <div class="hero-body">
        <p class="title">Router</p>
        <p class="subtitle">build your way <strong>up</strong></p>
      </div>
    </div>
    <div class="content ">
      <router-what />
    </div>
  </div>
</template>

<script>
import routerWhat from "@/components/router/what.vue"

export default {
  components: {
    routerWhat,
  }
}
</script>


<style lang="scss" scoped></style>
