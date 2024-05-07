<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="hero-body">
        <p class="title">Controller</p>
        <p class="subtitle">in between the <strong>Logic</strong></p>
      </div>
    </div>
    <div class="content">
      <controller-what/>
    </div>
  </div>
</template>

<script>
  import controllerWhat from "@/components/controller/what.vue"

  export default {
    components: {
      controllerWhat,
    }
  }
</script>


<style lang="scss" scoped></style>
