<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            dns
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Server</p>
          <p class="subtitle">server <strong>boot</strong> options</p>
        </div>
        <div>
        </div>
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
