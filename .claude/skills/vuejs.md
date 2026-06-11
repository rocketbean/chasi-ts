---
name: vuejs
description: Vue.js 3 Composition API patterns, reactivity, components, Pinia, Vue Router, and Quasar integration. Use when working on Vue frontend code in this project.
---

# Vue.js Skill

## Vue 3 Composition API

```ts
import { ref, computed, watch, onMounted } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);

watch(count, (newVal, oldVal) => { /* side effect */ });

onMounted(() => { /* DOM is ready */ });
```

- Prefer `<script setup>` SFCs — less boilerplate, full TypeScript support.
- `ref()` for primitives, `reactive()` for objects (but `ref()` works for both — be consistent).
- Never destructure `reactive()` objects — you lose reactivity. Use `toRefs()` if needed.

## Component Patterns

```vue
<script setup lang="ts">
defineProps<{ title: string; count?: number }>();
const emit = defineEmits<{ (e: "update", val: number): void }>();
</script>
```

- Use `defineProps` with generics for type-safe props (no need for `PropType` wrapper).
- Use `defineEmits` with typed event signatures.
- Expose internals selectively with `defineExpose()` — don't expose everything.

## Reactivity Gotchas

- Array mutations: `push`, `pop`, `splice` are reactive; direct index assignment (`arr[0] = x`) is **not** — use `arr.splice(0, 1, x)` or reassign the ref.
- Object additions: assigning a new property to a `reactive()` object IS reactive in Vue 3 (Proxy-based).

## Vue Router

```ts
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

router.push({ name: "Home", params: { id: 1 } });
const id = route.params.id;
```

## Pinia (State Management)

```ts
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const name = ref("");
  function setName(val: string) { name.value = val; }
  return { name, setName };
});
```

- Prefer the setup-style store (function syntax) over options API style.

## Quasar Integration (this project)

- Use Quasar components (`QBtn`, `QInput`, etc.) directly — auto-imported by the Quasar plugin.
- Use `$q.notify()` for toasts, `$q.dialog()` for modals.
- Quasar CSS utilities: `q-pa-md`, `q-mt-sm`, `text-primary`, etc.
- Build with `quasar build` / dev with `quasar dev`.

## Performance

- Use `v-memo` for expensive list renders.
- Lazy-load route components: `component: () => import('./MyView.vue')`.
- `shallowRef` / `shallowReactive` for large objects you don't need deep reactivity on.
