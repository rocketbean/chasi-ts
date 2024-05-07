<template>
  <div class = "search-list">
    <ul class = "search-rows glass" v-if = "rows.length">
      <row v-for="item in rows" :key = "item.id" :item="item" />
    </ul>
    <div class = "no-result glass " v-else>
      <div>
        <p class = "is-size-5 has-text-warning">
          Oops!
        </p>
        we can't find what you're looking for.
      </div>
    </div>
  </div>
</template>

<script setup>
import row from "./row.vue"
import { useControlStore } from "@/stores/ControlStore.js"
import { computed, onMounted } from "vue";

const ctx = useControlStore()
let collect = ctx.collection;
const rows = computed(() => {
  return ctx.searchRows
})

onMounted(() => {
  // ctx.setRows(ctx.collection)
})
</script>

<style scoped>
.no-result {
  display: grid;
  place-items: center;
  width:100%;
  height:100%;
}

.search-list {
  margin: 5px
}

.search-rows {
  width:100%;
  height:100%;
  grid-gap: 5px;
  display: grid;
  padding:10px;
}
</style>