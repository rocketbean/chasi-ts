<template>
<div class="modal" :class = "modal ? 'is-active' : ''" >
  <div class="modal-background" @click = "modalExit"></div>
  <div class="modal-content">
    <div class = "glass" style = "padding:10px">
      <p class="control has-icons-left"  >
        <input ref="searchKey" class="input search-input " type="text" placeholder="search" v-model="ctx.search.key"/>
        <span class="icon is-small material-symbols-rounded is-left">
          search
        </span>
      </p>
      <div class = "results" style = "padding-top:10px">
        <rows style = "position:relative; height:95%"/>
      </div>
    </div>

  </div>
  <button class="modal-close is-large" aria-label="close"></button>
</div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore.js"
import rows from "./rows.vue"
import { 
  ref, 
  computed,
  watch,
  onMounted
} from "vue"

const ctx = useControlStore()
const searchModal = ctx.searchModal
const searchKey = ref(null)
const collection = ctx.collection;

const modal = computed(() => {
  if(searchModal.open) focusEl()
  return searchModal.open
})
const sk = computed(() => {
  return ctx.search.key
})

const modalExit = () => {
  ctx.setModal(false)
}
const focusEl = () => {
  ctx.search.key = ""
  setTimeout(() => {
    searchKey.value.focus()    
  },200)
};

watch(sk, (val) => {
  let items = [];
  if(val === "") items = collection.slice(0,5)
  else items = collection.filter(c => c.keywords.join(" ").toLowerCase().includes(val.toLowerCase()));
  ctx.setRows(items)
})

onMounted(() => {
  ctx.setRows(collection.slice(0,5))
})
</script>

<style scoped>
.results {
  position: relative;
  height: 485px;
  max-height: 485px;
  min-height: 485px;
  overflow-y: auto;
}
</style>