<template>
  <div>
    <!-- Header -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="drizzle" />
            {{ drizzle.label }}
          </span>
          <span class="tag is-warning is-light is-medium">driver: "drizzle"</span>
        </div>
        <small>
          <span class="subtitle">[./src/config/database.ts]</span>
        </small>
      </div>
      <span class="sub-text">
        Chasi includes a first-class Drizzle ORM driver that runs alongside existing MongoDB and Prisma connections.
        Declare a connection with <code>driver: "drizzle"</code> in
        <tag v-bind="{ name: 'config/database.ts', style: 'is-primary', reference: 'dc-connections' }" />,
        point it at a schema file, and the query client is available in every controller
        via <code>this.models.connectionName._db</code>.
      </span>
    </section>

    <!-- Connection config -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>Configuration</span>
        </div>
      </div>
      <list :items="configItems" />
      <code-container
        mapping="database/drizzle/connection"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Connection examples (PostgreSQL · SQLite · MySQL)</p>
        </template>
      </code-container>
    </section>

    <!-- Schema -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="drizzle-schema" />
            Schema definition
          </span>
        </div>
        <small>
          <span class="subtitle">[./src/container/drizzle/schema.ts]</span>
        </small>
      </div>
      <span class="sub-text">
        {{ schema.text }}
      </span>
      <code-container
        mapping="database/drizzle/schema"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Named exports only — each exported table is available as
            <code>this.models.connectionName.tableName</code>
          </p>
        </template>
      </code-container>
    </section>

    <!-- Querying -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="drizzle-query" />
            Querying from a Controller
          </span>
        </div>
      </div>
      <span class="sub-text">
        {{ query.text }}
      </span>
      <code-container
        mapping="database/drizzle/query"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Full CRUD example using <code>this.models.pg._db</code></p>
        </template>
      </code-container>
    </section>

    <!-- Model.drizzle() -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="drizzle-model-method" />
            {{ modelMethod.label }}
          </span>
          <span class="tag is-info is-light is-medium">{{ modelMethod.type }}</span>
        </div>
      </div>
      <span class="sub-text">
        {{ modelMethod.text }}
      </span>
      <code-container
        mapping="database/drizzle/modelMethod"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Use outside a controller — service providers, events, scripts</p>
        </template>
      </code-container>
    </section>

    <!-- Setup guide -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="drizzle-setup" />
            Setup guide
          </span>
        </div>
      </div>
      <span class="sub-text">
        {{ setup.text }}
      </span>

      <ol class="setup-steps">
        <li>
          <strong>Install the client package for your adapter.</strong>
          <code-container mapping="database/drizzle/install" :options="shellOpts">
            <template v-slot:comment>
              <p>Pick the peer package that matches your connection's <code>adapter</code></p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Create a schema module that exports your tables as named exports.</strong>
          <code-container mapping="database/drizzle/schema" :options="codeOpts">
            <template v-slot:comment>
              <p>Named exports only — no default export</p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Declare a <code>driver: "drizzle"</code> connection with <code>options: { adapter, schema }</code>.</strong>
          <code-container mapping="database/drizzle/connection" :options="codeOpts">
            <template v-slot:comment>
              <p>Point <code>schema</code> at the module from step 2</p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Query via <code>Model.drizzle("name")</code> or <code>this.models.name</code>.</strong>
          <small class="grey-text">See the sections above.</small>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useControlStore } from "@/stores/ControlStore";

const ctx = useControlStore();

const drizzle      = ctx.dict["drizzle"]       || {};
const schema       = ctx.dict["drizzle-schema"] || {};
const query        = ctx.dict["drizzle-query"]  || {};
const modelMethod  = ctx.dict["drizzle-model-method"] || {};
const setup        = ctx.dict["drizzle-setup"] || {};

const codeOpts  = { lang: "ts", theme: "vitesse-dark" };
const shellOpts = { lang: "bash", theme: "vitesse-dark" };

// Config property items (adapter, schema path, globals)
const configItems = reactive(
  ["drizzle-adapter", "drizzle-schema", "drizzle-globals"]
    .map(id => {
      const entry = ctx.dict[id] || {};
      return {
        hook:  entry.id,
        title: entry.label,
        tag:   entry.type,
        desc:  entry.text,
      };
    })
);
</script>

<style scoped>
.setup-steps {
  list-style: decimal;
  padding-left: 28px;
  margin: 10px 0 0;
}
.setup-steps > li {
  margin-bottom: 22px;
}
.grey-text {
  color: grey;
}
</style>
