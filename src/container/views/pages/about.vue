<template>
  <h1 class = "text-reddish">
    about page hir2! 
  </h1>
</template>
<script>
export default {
  name: 'About',
  mounted() {
    console.log(this.$nuxt.error, "@@ error")
  },
  beforeCreate() {
  },
}
</script>