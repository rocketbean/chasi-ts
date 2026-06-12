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

EventHandler.on('hookto', (ev) => {
  if (props.id !== ev.to) return
  const el = target.value
  if (!el) return

  // Directly target the web2 scrollable container.
  // Generic "find scrollable ancestor" fails because .main-content has
  // overflow-x:hidden which forces the browser to implicitly set
  // overflow-y:auto on it, making the loop stop at the wrong element.
  const main = document.querySelector('.w2-main')
  if (main) {
    const elRect   = el.getBoundingClientRect()
    const mainRect = main.getBoundingClientRect()
    main.scrollTo({ top: main.scrollTop + (elRect.top - mainRect.top) - 20, behavior: 'smooth' })
  } else {
    // fallback for other layouts (e.g. web engine)
    const scrollPos = el.offsetTop - 20
    el.offsetParent?.scrollTo({ top: scrollPos, behavior: 'smooth' })
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