<template >
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="tst-vitest-config" />
            vitest.config.ts
          </span>
        </div>
        <small>
          <span class="subtitle"> https://vitest.dev/config/#env </span>
        </small>
      </div>
      <span class="sub-text">
        Vitest can be configured at [*root*/vitest.config.ts], Chasi provides a default config that works with [*root*/test] directory, developers can check other vitest configurations that can be suitable for the needs at vitest website.
      </span>
      <code-container mapping="testing/vitestConfig" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <p> Default vitest config </p>
        </template>
        <template v-slot:notes>
          <a href="https://vitest.dev/config/#env" target="new"> https://vitest.dev/config/#env </a>
        </template>
      </code-container>
    </section>
  </div>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
let ctx = useControlStore();
const testing = ctx.dict["testing"]
</script>