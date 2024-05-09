<template>
  <div >
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            fork_right
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Router</p>
          <p class="subtitle">build your way <strong>up</strong></p>
        </div>
        <div>
        </div>
      </div>
    </div>
    <div class="content " >
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
