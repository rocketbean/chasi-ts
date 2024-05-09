<template >
  <div 
    data-theme="dark" 
    class = "main-container" 
    @keydown.ctrl.k.prevent="toggleModal"
    @keydown.esc="escapeModal"
    tabindex="-1"
    >
    <ideal />
    <search />
    
    <div class="container text-light" >
      <div class="parent page" >
        <header class="">
          <navbar />
        </header>
        <div class="left-panel">
          <chasi />
          <left-menu />
        </div>
        <main class="glass" >
          <container />
        </main>
        <div class="right-panel">
          <right-general />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chasi from "../components/left/chasi.vue"
import leftMenu from "../components/left/menu.vue"
import navbar from "../components/header/navbar.vue"
import rightGeneral from "../components/right/general.vue"
import container from "./main/container.vue"
import ideal from "@/components/ideal.vue"
import { useControlStore } from "@/stores/ControlStore.js"

const ctx = useControlStore()
export default {
  components: {
    ideal,
    chasi, 
    navbar,
    container,
    leftMenu: leftMenu,
    rightGeneral: rightGeneral,
  },
  setup() {
    const toggleModal = () => {
      ctx.toggleModal()
    }
    const escapeModal = () => {
      ctx.setModal(false)
    }
    return {toggleModal, escapeModal}
  },
  data() {
    return {
      document: true,
    }
  }
}
</script>