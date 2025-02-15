<template>
  <li class = "row-item has-background-dark has-text-primary-light" @click = "activateAndScroll">
    <div class = "row-container">
      <div class = "item-top">
        <span class = "is-size-5">
          {{props.item.label}}
        </span>
        <div  v-if = "props.item?.reference">
          <span v-for = "(reference, i) in props.item.reference" :key="i" style = "padding:2px">
            <a class = "tag in-tag" > {{ reference }} </a>
          </span>
        </div>
      </div>
      <div class = "item-content is-size-7 has-text-grey-light">
        {{textLimit(props.item.text)}}
      </div>
    </div>
  </li>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore";
import {EventHandler} from "@/assets/event-handler";

const ctx = useControlStore()
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const textLimit = (str) => {
  let text = ""
  if(str?.length > 200) text = `${str?.substring(0, 200)}...`;
  else text = str;
  return text;
}

const activateAndScroll = () => {
  if(props.item?.loc) {

    let loc = props.item.loc.split("@")[0];
    let subject = props.item.loc.split("@")[1];
    ctx.activate(loc)
    ctx.setModal(false)

    setTimeout(() => {
      EventHandler.emit('hookto', {to: subject})
    }, 600)
  }
}
</script>

<style lang="scss" scoped>
.row-item {
  width:100%;
  border-radius: 5px;
  display: flex;
  padding:10px;
  max-height: 200px;
}

.row-item:hover {
  background-color: #41969e !important;
  cursor: pointer;
}

.row-container {
  display: grid;
  width:100%;
}

.item-top {
  width:100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}
</style>
