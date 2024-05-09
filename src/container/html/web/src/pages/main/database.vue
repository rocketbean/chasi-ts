<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="title-container">
        <div style = "display:grid; place-items: center;width: 70px">
          <span class="material-symbols-rounded is-size-1" style = "border:3px solid white; border-radius: 50%;">
            storage
          </span>
        </div>
        <div class="hero-body" style="padding-left: 0px">
          <p class="title">Database</p>
          <p class="subtitle">store <strong>meaningful</strong> information</p>
        </div>
        <div>
          
        </div>
      </div>
    </div>
    <div class="content">
      <database-what/>
    </div>
  </div>
</template>

<script>
  import databaseWhat from "@/components/database/what.vue"

  export default {
    components: {
      databaseWhat,
    }
  }
</script>


<style lang="scss" scoped></style>
