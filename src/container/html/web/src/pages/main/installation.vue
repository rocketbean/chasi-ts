<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="hero-body">
        <p class="title">Installation</p>
        <p class="subtitle">simplify your <strong>strategy</strong></p>
      </div>
    </div>
    <div class="content">
      <installationHow/>
      <gettingStarted/>
    </div>
  </div>
</template>

<script>
  import installationHow from "@/components/installation/how.vue"
  import gettingStarted from "@/components/installation/gettingStarted.vue"

  export default {
    components: {
      installationHow,
      gettingStarted
    }
  }
</script>


<style lang="scss" scoped></style>
