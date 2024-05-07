<template>

  <div class="modal " :class = "modal ? 'is-active' : ''" >
  <div class="modal-background" @click = "modalExit"></div>
  <div class="modal-content glass" style="overflow: hidden;">
    <div class = "contain">
      <div  style = "padding:10px">
        <figure class="image is-128x128">
          <img class="is-rounded" style = "border: 1px solid grey" src="/src/assets/default.png" />
        </figure>
      </div>
      <div style = "display:flex; flex-direction: column; justify-content: center; align-items: center;" class = "has-text-grey-light">
        <span><strong>NM</strong> buy me a coffee 
        <span class="material-symbols-rounded" >
          local_cafe
        </span>
        </span>
        <span>buzzrocketbean@gmail.com</span>
      </div>
      <div class = "logos has-text-grey-light">
        <a class="image is-48x48" href = "https://www.npmjs.com/~rocketbean" target = "new">
          <img src="/src/assets/npm.svg" class="svg-logo" />
        </a>
        <a class="image is-48x48" href = "https://github.com/rocketbean" target = "new">
          <img src="/src/assets/square-github.svg" class="svg-logo" />
        </a>
        <a class="image is-48x48" href = "https://www.linkedin.com/in/nikko-mesina-017403132/" target = "new">
          <img src="/src/assets/linkedin.svg" class="svg-logo"/>
        </a>
      </div>
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" @click = "modalExit"></button>
</div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore.js"
import {computed} from "vue"
const ctx = useControlStore()
const aboutModal = ctx.aboutModal
const modal = computed(() => {
  return aboutModal.open
})

const modalExit = () => {
  ctx.setAboutModal(false)
}

</script>

<style scoped>
.image {
  margin:4px;
}

.glass {
  border: 1px solid white
}
.contain {
  width:100%;
  padding:20px;
  height:auto;
  display: grid;
  place-items: center;
}

.logos {
  display:flex; 
  flex-direction: row; 
  justify-content: center;
  align-items: center;
  width:100%;
}

.svg-logo {
  filter: invert(88%);
  cursor: pointer;
}

</style>