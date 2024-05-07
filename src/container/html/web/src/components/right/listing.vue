<template>
  <div>
    <div class="panel-block" >
      <p class="control has-icons-left "  >
        <input class="input search-input " type="text"  tabindex="-1" placeholder="Ctrl[k] to search" disabled/>
        <span class="icon is-small material-symbols-rounded is-left">
          search
        </span>
      </p>
    </div>

    <div
    class=" panel-block is-active has-text-light is-size-7" 
    v-for="cat in ctx.subcats"
    :key ="cat.to"
    >
    <div class = "list-col" >
      <a 
        class = "list-row"  
        :class="activeScr.target.id === cat.to ? 'list-item-active' : ''" 
        @click = "EventHandler.emit('hookto', cat)"
      >
        <div class = "icon-box">
          <Transition name="slide-down">
            <span class="material-symbols-rounded" v-if = "activeScr.target.id === cat.to">
              emergency
            </span>
            <span class="material-symbols-rounded" v-else>
              {{ (cat?.group?.length >  0 )? 'expand_more'  : 'chevron_right'}}
            </span>
          </Transition>
        </div>
        <p >
          {{cat.label}}
        </p>
      </a>
      <div v-if="cat?.group?.length >  0" style = "margin-left:10px">
        <div class = "list-col" v-for = "item in cat.group" :key = "item.to">
          <a 
            class = "list-row " 
            :class="activeScr.target.id === item.to ? 'list-item-active' : ''" 
            @click = "EventHandler.emit('hookto', item)">
            <div class = "icon-box" >
              <Transition name="slide-down">

                <span class="material-symbols-rounded" v-if = "activeScr.target.id === item.to">
                  emergency
                </span>
                <span class="material-symbols-rounded" v-else>
                  subdirectory_arrow_right
                </span>
              </Transition>
            </div>
            <span >
              {{item.label}}
            </span>
          </a>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { useControlStore } from "../../stores/ControlStore"
import { computed } from "vue";
import {EventHandler} from "@/assets/event-handler";

const controlStore = useControlStore()
const activeScr = computed(() => {
  return controlStore.scr
})

const ctx = computed(() => {
  return controlStore.ctx
})




</script>

<style lang="scss" scoped>
.search-input:disabled {
  cursor: pointer;
}
.list-row {
  color: grey;
  width:100%;
  display:grid;
  grid-template-columns: 20px 1fr;
  margin: 4px;
  border-radius: 5px;
}

.list-row:hover {
  background: grey;
  color:white
}

.list-item-active {
  transform: translateX(5px);
  color: white;
}

.icon-box{ 
  display: flex;
  align-items: center;
  overflow: hidden;
  max-width:20px;
  position:relative;
}
.icon-box span{ 
  width:20px;
}

</style>