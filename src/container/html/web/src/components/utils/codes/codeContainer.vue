<template>
  <div class="code-container">
    <div class="comment" v-if="$slots.comment">
      <slot name="comment"/>
    </div>

    <div class="code-wrap" v-if="codeTemp">
      <button
        class="code-copy-btn"
        :class="{ copied }"
        @click="copyCode"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <span class="material-symbols-rounded">{{ copied ? 'check' : 'content_copy' }}</span>
      </button>
      <div v-html="codeTemp" />
    </div>

    <div class="notes-container" v-if="$slots.notes">
      <div class="is-fluid">
        <div class="notification is-dark">
          <slot name="notes"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { codemap } from "@/data/codemap"
import { codeToHtml, CodeToHastOptions } from "shiki"
import { ref } from "vue"

const props = defineProps({
  mapping: { type: String },
  options: {
    type: Object,
    default: (raw): CodeToHastOptions => {
      const defOpt: CodeToHastOptions = { lang: "javascript", theme: "vitesse-dark" }
      if (raw?.options) return Object.assign(defOpt, raw?.options)
      return defOpt
    }
  }
})

const codeTemp = ref<any>(null)
const rawCode  = ref("")
const copied   = ref(false)

const consumeStrMap = (str: string): string => {
  try {
    if (!str.includes("/")) return str
    return str.split("/").reduce((a: any, b: string) => a[b], codemap)
  } catch { return str }
}

rawCode.value = consumeStrMap(props.mapping)

codeToHtml(rawCode.value, <CodeToHastOptions>props.options).then(d => {
  codeTemp.value = d
})

async function copyCode() {
  if (copied.value) return
  try {
    await navigator.clipboard.writeText(rawCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard API unavailable (e.g. SSR context)
  }
}
</script>

<style scoped>
.code-container {
  margin: 10px;
  position: relative;
}
.comment {
  color: #666;
  margin: 5px;
  padding-left: 10px;
  font-size: 90%;
}
.notes-container, .is-fluid, .notification {
  color: rgb(168, 168, 168);
  border-radius: 0 0 6px 6px;
  position: relative;
  overflow: hidden;
}
.notification { padding: 5px; display: grid; place-items: center; }
</style>
