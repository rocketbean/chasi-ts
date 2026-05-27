<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style="display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style="border:3px solid white; border-radius: 50%;">
            local_activity
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Observer</p>
          <p class="subtitle">async <strong>events</strong> across the app lifecycle</p>
        </div>
      </div>
    </div>
    <div class="content">
      <observer-what />
    </div>
  </div>
</template>

<script>
import observerWhat from "@/components/observer/what.vue"

export default {
  components: {
    observerWhat,
  }
}
</script>

<style lang="scss" scoped></style>
