<template>
  <a class="tag in-tag" :class="props.style"  >
    <div class="on-hover " >
      <div class="hover-container shadow-2" >
        <div class="hover-content">
          <div class="content" v-if="data">
            <h1>{{ data.label }}</h1>
            <div v-if = "data.reference">
              <a 
                v-for = "(rfr, i) in data.reference" 
                class = "tag in-tag "
                style = "margin:2px"
                :key = "i"
                > {{ rfr }} 
              </a>
            </div>
            <inline-separator margin="none" />
            <p>
              {{ data.text }}
            </p>
          </div>
        </div>
      </div>
    </diV>
    {{ props.name }}
  </a>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import { ref } from "vue"
let ctx = useControlStore();
const data = ref(null);
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  src: {
    type: String
  },
  style: {
    type: String
  }
})

if (props.reference) {
  data.value = ctx.dict[props.reference]
}
</script>

<style lang="scss" scoped>
  .in-tag {
    position: relative;
  }

  .on-hover {
    display: none;
    position: absolute;
    bottom: 100%;
    z-index: 9999 !important; 
    left: 0px;
  }

  .hover-container {
    position: relative;
    width: 250px;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 200px;
    max-width: 350px;
    padding:10px;
    margin:10px;
    background: rgb(15, 15, 15);
    border-radius: 10px;
    z-index:2000;
  }

  .hover-content {
    display: grid;
    grid-template: auto / auto;
    white-space: pre-wrap;
    max-height: 320px;
    max-width: 350px;
    color:white;
    text-align: start;
    word-wrap: break-word;
    place-items: center;
    z-index:2000 !important; 
  }

  .in-tag:hover .on-hover,
  .on-hover:hover {
    display:inline-flex;
  }
</style>