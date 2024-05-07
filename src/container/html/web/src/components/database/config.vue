<template>
    <list :items="data.list" :header="{ name: '<DatabaseConfig>', hook: 'DatabaseConfig' }" />
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import {reactive} from "vue";
let ctx = useControlStore();
const db = ctx.ref("DatabaseConfig")

const data = reactive({list: []})

db.forEach(subject => {
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