<template >
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
        <tag v-bind="{ name: 'DatabaseConfig.connections', style: 'is-primary', reference: 'dc-connections' } " />, the handler also supports multi-tenancy which should be declared in the connections config first, and models will be switched vie the connect() method. the Hanlder is currently focused on MongoDB, however there future plans to adopt ORM to support multiple types of databases.

      </span>
    </section>

    <db-config/>
    <db-model/>

  </div>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
import DbConfig from "./config.vue"
import DbModel from "./model.vue"
let ctx = useControlStore();
const db = ctx.dict["database"]
const config = ctx.dict["DatabaseConfig"]


</script>

<style scoped></style>