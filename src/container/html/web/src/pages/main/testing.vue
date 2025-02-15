<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            labs
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">API Testing</p>
          <p class="subtitle">build with <strong>confidence</strong>.</p>
        </div>
        <div>
          
        </div>
      </div>
    </div>
    <div class="content">
      <testing-what/>
    </div>
  </div>
</template>

<script>
  import testingWhat from "@/components/testing/what.vue"

  export default {
    components: {
      testingWhat,
    }
  }
</script>


<style lang="scss" scoped></style>
