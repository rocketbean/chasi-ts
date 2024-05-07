<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="hero-body">
        <p class="title">Server</p>
        <p class="subtitle">server boot options</p>
      </div>
    </div>
    <div class="content">
      <server-what/>
    </div>
  </div>
</template>

<script>
  import serverWhat from "@/components/server/what.vue"

  export default {
    components: {
      serverWhat,
    }
  }
</script>


<style lang="scss" scoped></style>
