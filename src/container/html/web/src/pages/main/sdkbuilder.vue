<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style="display:grid; place-items: center; width: 70px">
          <span class="material-symbols-rounded is-size-1" style="border:3px solid white; border-radius: 50%;">
            api
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">SDK Builder</p>
          <p class="subtitle">generate a <strong>JavaScript SDK</strong> from your routes</p>
        </div>
      </div>
    </div>
    <div class="content">
      <sdkbuilder-what />
    </div>
  </div>
</template>

<script>
import sdkbuilderWhat from "@/components/sdkbuilder/what.vue"

export default {
  components: { sdkbuilderWhat }
}
</script>

<style lang="scss" scoped></style>
