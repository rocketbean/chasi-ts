<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            videogame_asset
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Controller</p>
          <p class="subtitle">in between the <strong>Logic</strong></p>
        </div>
        <div>
        </div>
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
