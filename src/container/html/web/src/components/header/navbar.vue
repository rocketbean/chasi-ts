<template>
  <about/>
  <nav class="navbar glass curved-border" role="navigation" aria-label="dropdown navigation">
    <span class="navbar-item is-size-5">
      /{{ controlStore.ctx.label }}{{ activeScr?.target?.id ? `@${activeScr.target.id}` : ''}}
    </span>
    <div class="navbar-item navbar-end ">
      <div class="buttons">
        <a class="button  is-info is-small is-dark" href = "https://github.com/rocketbean/chasi-ts" target="new">Github</a>
        <a class="button is-info is-small is-dark" href = "https://www.npmjs.com/package/@rocketbean/create-chasi" target = "new">CLI</a>
        <button class="button  button-round  is-success  is-dark" @click = "openAbout">
          <span class="material-symbols-rounded" >
            account_circle
          </span>
        </button>
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
    const openAbout = () => {
      controlStore.setAboutModal(true);
    }
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
      openAbout,
      ctx
    }
  }
}

</script>

<style scoped>
.subheader {
  height:auto;
  position: relative;
  overflow: hidden;
}

.button-round {
  border-radius: 50% !important;
  height:auto;
  width:30px;
}
</style>