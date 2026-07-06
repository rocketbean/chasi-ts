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
              <i class="grey-text sub-caption"><template v-for="(p, i) in tagParts(item.tag)" :key="i"><tag v-if="p.type || p.to" inline :name="p.text" :type="p.type" :to="p.to" /><template v-else>{{ p.text }}</template></template></i>
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
import { useControlStore } from "@/stores/ControlStore"
import { EventHandler } from "@/assets/event-handler"
import { computed } from "vue"
import tag from "@/components/utils/tag/tag.vue"

const props = defineProps({
  header: {
    type: Object
  },
  items: {
    type: Array,
    required: true
  }
})

const ctx = useControlStore()
// Map a wrapped type label (e.g. "<SdkRouterSelector>") to its anchor id, so a type tag
// links to that type's own <list>. Primitive tags like <string> match nothing → stay plain.
const labelToId = computed(() => {
  const m: Record<string, string> = {}
  Object.values(ctx.dict || {}).forEach((e: any) => {
    if (e?.label && e?.id && /^<.+>$/.test(e.label)) m[e.label] = e.id
  })
  return m
})
const tagParts = (tag?: string) => {
  if (!tag) return []
  // Link a type NAME whenever a `<Name>` definition entry exists — so it works both bare
  // (`<SdkRouterSelector>`) and nested (`Record<string, ApiSpecSchemaAxisFilter>`). Primitive
  // names like `string` have no `<string>` entry, so they stay plain (backward-compatible).
  const re = /[A-Za-z_][A-Za-z0-9_]*/g
  const parts: any[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(tag))) {
    if (m.index > last) parts.push({ text: tag.slice(last, m.index) })
    parts.push({ text: m[0], to: labelToId.value["<" + m[0] + ">"], type: ctx.types?.[m[0]] ? m[0] : undefined })
    last = m.index + m[0].length
  }
  if (last < tag.length) parts.push({ text: tag.slice(last) })
  return parts
}
const scrollTo = (id: string) => EventHandler.emit("hookto", { to: id })

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
.type-ref {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  color: #7aa2d6;
}
.type-ref:hover { color: #a9c7f0; }
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