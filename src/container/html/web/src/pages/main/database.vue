<template>
  <div>
    <div class="hero is-small is-dark">
      <div class="hero-body">
        <p class="title">Database</p>
        <p class="subtitle">database</p>
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
