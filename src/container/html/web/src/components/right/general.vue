<template>
  <article class="panel is-primary glass right-panel">
    <listing/>
  </article>
</template>

<script>
import { useControlStore } from "../../stores/ControlStore"
import anime from 'animejs';
import listing from "./listing.vue" 
import { computed, watch } from "vue";

export default {
  components: {
    listing
  },
  beforeCreate() {
  },
  setup() {
    const controlStore = useControlStore()
    const controls = controlStore.rightControls 
    const ctx = computed(() => {
      return controlStore.ctx
    })
    watch(controls, (val) => {
      let pos = '200px';
      if(!val.open) pos = '0px';
      anime({
        targets: '.right-panel',
        width: pos,
        display: "none",
        duration: '200ms',
        easing: 'easeInOutSine',
      });
    })
    return {
      controlStore,
      ctx
    }
  }
}
</script>

<style >
.panel {
  box-shadow: none !important;
}
.right-panel {
  overflow-x: hidden;
  width: 0px;
}
</style>