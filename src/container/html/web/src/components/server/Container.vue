<template>
  <section class="section ">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <hook :id="serverContainer.id" />
        <span> {{ serverContainer.label }} </span>
      </div>
    </div>
    <div class="sub-text ">
      {{ serverContainer.text }}
    </div>
  </section>
  <list :items="data.list" />

</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
import {reactive} from "vue"
let ctx = useControlStore();
const serverContainer = ctx.dict["serverContainer"]
const serverContainers = ctx.ref("serverContainer")

const data = reactive({list: []})

serverContainers.forEach(subject => {
  let item = {
    hook: subject.id,
    title: subject.label,
    desc: subject.text
  }

  if(subject.type) item.tag = subject.type;
  if(subject.coderef) {
    item.codeContent = {
      mapping: subject.coderef.ref,
      options: {
          lang: "ts",
          theme: 'vitesse-dark',
      }
    }
  }
  data.list.push(item)
});

</script>