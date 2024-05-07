<template>
  <span 
    class = "inline-separator"
    :class = "props.margin + '-margin'"
     >
    <i> </i>
  </span>
</template>

<script lang = "ts" setup>
  const props = defineProps({
    margin: {
      type: String,
      required: false,
      default: "lg"
    },
  })
</script>

<style lang="scss" scoped>
.lg-margin {
  margin: 0 30px 0 30px;
}

.inline-separator {
  display: grid;
  place-items: center;
  height: 20px;
  }
  
  .inline-separator i {
    border-bottom: 1px solid rgb(142, 142, 142);
      width: 100%;
}

</style>