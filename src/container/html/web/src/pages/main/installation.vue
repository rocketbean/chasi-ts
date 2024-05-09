<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            settings_input_svideo
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Installation</p>
          <p class="subtitle">simplify your <strong>strategy</strong></p>
        </div>
        <div>
        </div>
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
