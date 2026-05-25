<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="database" />
            {{ db.label }}
          </span>
        </div>
        <small>
          <span class="subtitle">{{ db.sublabel }}</span>
        </small>
      </div>
      <span class="sub-text">
        Chasi Database Handler automatically connects on the declared named connection in
        <tag v-bind="{ name: 'DatabaseConfig.connections', style: 'is-primary', reference: 'dc-connections' }" />.
        Supports <strong>MongoDB</strong>, <strong>Prisma</strong>, and <strong>Drizzle ORM</strong> —
        all connections live in a single config file and connect automatically at boot.
      </span>
    </section>

    <db-config/>
    <db-model/>
    <db-drizzle/>

  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import DbConfig from "./config.vue"
import DbModel from "./model.vue"
import DbDrizzle from "./drizzle.vue"

const ctx = useControlStore();
const db = ctx.dict["database"]
</script>

<style scoped></style>