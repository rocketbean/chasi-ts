<template>
  <div class = "code-container">
    <div class = "comment" v-if="$slots.comment">
      <slot name = "comment"/>
    </div>
    
    <!-- rendered code -->
    <div v-html = "codeTemp" v-if = "codeTemp"/>
    <!-- rendered code -->

    <div class="notes-container" v-if="$slots.notes">
      <div class=" is-fluid">
        <div class="notification is-dark">
          <slot name = "notes"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang = "ts" setup>
import {codemap} from "@/data/codemap"
import {codeToHtml, CodeToHastOptions} from "shiki"
import {ref} from "vue";

const props = defineProps({
  mapping: {
    type: String,
  },
  options: {
    type: Object,
    default: (raw): CodeToHastOptions=> {
      const defOpt: CodeToHastOptions = {
          lang: "javascript",
          theme: 'vitesse-dark'
      }
      if(raw?.options) return Object.assign(defOpt, raw?.options)
      return defOpt
    }
  }
})

const codeTemp = <any>ref(null);

const consumeStrMap = (str): string => {
  try {
    if(!str.includes("/")) return str;
    return str.split("/").reduce((a,b) => a[b], codemap)
  } catch { return str }
}

codeToHtml(consumeStrMap(props.mapping), 
  <CodeToHastOptions>props.options
).then(d => codeTemp.value = d);

</script>

<style scoped>
.code-container {
  margin:10px;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.notification {
  padding:5px;
  display: grid;
  place-items: center;
}

.notes-container, .is-fluid, .notification {
  color: rgb(168, 168, 168);
  border-radius: 0px 0px 10px 10px;
  position: relative;
  overflow: hidden;

}

.comment{
  color: grey;
  margin:5px;
  padding-left: 10px;
  font-size: 95%;
}
</style>