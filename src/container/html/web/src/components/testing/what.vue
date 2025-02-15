<template >
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="testing" />
            {{ testing.label }}
          </span>
        </div>
        <small>
          <span class="subtitle">{{ testing.sublabel }}</span>
        </small>
      </div>
      <span class="sub-text">
        Test-Driven Development practice is fully supported by Chasi, powered by vitest, Developers can check the default <tag v-bind="{ name: 'vitest', style: 'is-primary', reference: 'vitest' } " /> configuration in [&lt;root&gt;/vitest.config.ts], you can also check environment variables [&lt;root&gt;/test/.env.test] being passed when working with TDD. By default, when process.env[testMode] is enabled, compiler engines will be disabled as vitest will be working with [./src] directory with Typescript.
      </span>
    </section>
    <vitest-setup/>
    <environment/>
    <usage-tdd/>

  </div>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
import vitestSetup from "./vitest-setup.vue"
import environment from "./environment.vue"
import usageTdd from "./usage-tdd.vue"
let ctx = useControlStore();
const testing = ctx.dict["testing"]

console.log(testing)
</script>

<style scoped></style>