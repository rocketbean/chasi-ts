<template>
  <div class="list-container">
    <div class="pan-title" v-if="props.header">
      <div class="x-center is-size-6 item">
        <div class="item-title x-center">
          <div class="x-center">
            <strong v-if="props.header.name">
              <hook v-if = "props.header.hook" :id = "props.header.hook"  />
              {{ props.header.name }} 
            </strong>
            <small class="grey-text" v-if="props.header.desc"> {{ props.header.desc }} </small>
          </div>
        </div>
      </div>
    </div>
    <section v-for="(item, index) in props.items" :key="index" style="margin: 10px">
      <inline-separator v-if="index > 0" />
      <div class="pan-title">
        <div class="x-center is-size-5 item">
          <div class="item-title x-center">
            <div class="x-center">
              <span class="material-symbols-rounded">
                arrow_right
              </span>
              <strong>
                <hook v-if = "item?.hook" :id = "item.hook" /> 
                {{ item.title }} 
              </strong>
              <small class="grey-text sub-caption" > {{ item.sub }} </small>
            </div>
            <div />
            <small>
              <i class="grey-text sub-caption"> {{ item.tag }} </i>
            </small>
          </div>
        </div>
      </div>
      <div class="sub-text " v-html="item.desc">
      </div>
      <code-container :options="item?.codeContent?.options || {}" :mapping="item.codeContent.mapping"
        v-if="item.codeContent">
        <template v-slot:comment v-if="item.codeContent.comment">
          <p>{{ item.codeContent.comment }}</p>
        </template>
        <template v-slot:notes v-if="item.codeContent.notes">
          <small>
            {{ item.codeContent.notes }}
          </small>
        </template>
      </code-container>
    </section>
  </div>

</template>

<script lang = "ts" setup>

const props = defineProps({
  header: {
    type: Object
  },
  items: {
    type: Array,
    required: true
  }
})

</script>

<style scoped>
.sub-caption {
  font-size: 65%;
}
.item {
  width:100%;
  padding: 5px;
}
.item > .item-title {
  display: grid;
  width:100%;
  grid-template-columns: auto 1fr auto;
}

.grey-text {
  color: grey;
}
.list-container {
  padding: 35px;
}
.list-container .pan-title {
  margin-bottom: 5px;
}
.list-container .sub-text {
  padding-left: 18px;
  padding-right: 18px;
}
</style>