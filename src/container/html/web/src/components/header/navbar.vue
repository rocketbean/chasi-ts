<template>
  <nav class="navbar glass curved-border" role="navigation" aria-label="dropdown navigation">
    <span class="navbar-item is-size-5">
      /{{ controlStore.ctx.label }}{{ activeScr?.target?.id ? `@${activeScr.target.id}` : ''}}
    </span>
    <div class="navbar-item navbar-end ">
      <div class="buttons">
        <button class="button  is-primary is-small">Github</button>
        <button class="button  is-info is-small">Docs</button>
      </div>

    </div>
  </nav>
  
  <section class="hero is-primary subheader" >
      <div class="hero-body">
        <p class="title">
          Chasi Docs
        </p>
        <p class="subtitle">
          Everything you <strong>need</strong> to <strong>know</strong>.
        </p>
      </div>
  </section>
</template>

<script >
import { useControlStore } from "../../stores/ControlStore";
import anime from 'animejs';
import { watch, computed } from "vue";
export default {
  mounted() {

  },
  setup() {
    const controlStore = useControlStore()
    const ctx = controlStore.ctx
    const controls = controlStore.headerControls 
    const activeScr = computed(() => {
      return controlStore.scr
    })
    watch(controls, (val) => {
      let subheader = val.subheader
      let pos = '150px';
      if(!subheader.open) pos = '0px';
      anime({
        targets: '.subheader',
        height: pos,
        duration: '300ms',
        easing: 'easeInOutSine',
      });
    })
    
    return {
      controlStore,
      activeScr,
      ctx
    }
  }
}

</script>

<style>
.subheader {
  height:auto;
  position: relative;
  overflow: hidden;
}
</style>