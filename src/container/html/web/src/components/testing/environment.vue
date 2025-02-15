<template >
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook :id="env.id" />
            {{ env.label }}
          </span>
        </div>
        <small>
          <span class="subtitle"> {{env.sublabel}} </span>
        </small>
      </div>
      <span class="sub-text">
        {{ env.text }}
      </span>
      <code-container mapping="testing/env" :options="{ theme: 'vitesse-dark', lang: 'dotenv' }">
        <template v-slot:comment>
          <p> Default environment config </p>
        </template>
        <template v-slot:notes>
          <p> ./test/.env.test </p>
        </template>
      </code-container>
    </section>
  </div>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
let ctx = useControlStore();
const env = ctx.dict["tst-env"]
console.log(env, "@env")
</script>