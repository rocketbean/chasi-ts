<template>
  <span ref = "target" :id = "hookId" :observer-id = "props.id">
    <small class="material-symbols-rounded" >
      anchor
    </small>
  </span>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore.js"
import {EventHandler} from "@/assets/event-handler";
import { onMounted, ref } from "vue"

const controlStore = useControlStore()
const props = defineProps({
  id: String,
})

const hookId = `anchor_${props.id}`
const target = ref(null)

EventHandler.on('hookto', 
(ev) => {
  if(props.id === ev.to) {
    let scrollPos = target.value.offsetTop - 20;
    target.value.offsetParent.scrollTo({
      top: scrollPos,
      behavior:  "smooth"
    })
  }
}, {id: hookId})

onMounted(() => {
  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.intersectionRatio >= 0.5) {
        let targetEl = entry.target.attributes["observer-id"].value
        controlStore.setViewPort({id: targetEl})
      }
    })
  }, {
    rootMargin: "0px 0px -70% 0px",
    threshold: 1.0,
  })
  observer.observe(target.value)
})


</script>