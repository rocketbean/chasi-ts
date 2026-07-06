<template>
  <div>
    <!-- Header -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="prisma" />
            {{ prisma.label }}
          </span>
          <span class="tag is-warning is-light is-medium">driver: "prisma"</span>
        </div>
        <small>
          <span class="subtitle">[./src/config/database.ts]</span>
        </small>
      </div>
      <span class="sub-text">
        Chasi ships a first-class Prisma driver alongside MongoDB and Drizzle ORM. Prisma 7 moves the
        datasource URL out of <code>schema.prisma</code> and into <code>prisma.config.ts</code>, connecting
        through a <strong>driver adapter</strong>. Declare a <code>driver: "prisma"</code> connection in
        <tag v-bind="{ name: 'config/database.ts', style: 'is-primary', reference: 'dc-connections' }" />
        whose <tag v-bind="{ name: 'PrismaOptions', type: 'PrismaOptions' }" /> options point at the generated
        client and pass the adapter through <code>globals</code>. The live client is then available in every
        controller via <code>this.models.connectionName</code>.
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
        mapping="database/prisma/connection"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>A <code>driver: "prisma"</code> connection (PostgreSQL via the pg adapter)</p>
        </template>
      </code-container>
    </section>

    <!-- Setup guide -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="prisma-setup" />
            Setup guide
          </span>
        </div>
        <small>
          <span class="subtitle">Prisma 7 · driver-adapter</span>
        </small>
      </div>
      <span class="sub-text">
        {{ setup.text }}
      </span>

      <ol class="setup-steps">
        <li>
          <strong>Install the client, CLI, and a driver adapter.</strong>
          <code-container mapping="database/prisma/install" :options="shellOpts">
            <template v-slot:comment>
              <p><code>@prisma/client</code> plus a <code>@prisma/adapter-*</code> package for your database</p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Configure <code>prisma.config.ts</code> and <code>schema.prisma</code>.</strong>
          <code-container mapping="database/prisma/config" :options="codeOpts">
            <template v-slot:comment>
              <p>Prisma 7 — the datasource <code>url</code> lives in <code>prisma.config.ts</code>, not the schema</p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Add a <code>driver: "prisma"</code> connection in <code>src/config/database.ts</code>.</strong>
          <code-container mapping="database/prisma/connection" :options="codeOpts">
            <template v-slot:comment>
              <p>Pass the adapter through <code>options.globals</code></p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Generate the client (and push the schema).</strong>
          <code-container mapping="database/prisma/generate" :options="shellOpts">
            <template v-slot:comment>
              <p>Writes the client into <code>schema.prisma</code>'s <code>output</code> dir</p>
            </template>
          </code-container>
        </li>
        <li>
          <strong>Query it from a controller or via <code>Model.prisma()</code>.</strong>
          <small class="grey-text">See the sections below.</small>
        </li>
      </ol>
    </section>

    <!-- Querying -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="prisma-query" />
            Querying from a Controller
          </span>
        </div>
      </div>
      <span class="sub-text">
        {{ query.text }}
      </span>
      <code-container
        mapping="database/prisma/query"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Full CRUD using <code>this.models.pg.user</code> (model names are lower-cased)</p>
        </template>
      </code-container>
    </section>

    <!-- Model.prisma() -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span>
            <hook id="prisma-model-method" />
            {{ modelMethod.label }}
          </span>
          <span class="tag is-info is-light is-medium">{{ modelMethod.type }}</span>
        </div>
      </div>
      <span class="sub-text">
        {{ modelMethod.text }}
      </span>
      <code-container
        mapping="database/prisma/modelMethod"
        :options="codeOpts"
      >
        <template v-slot:comment>
          <p>Use outside a controller — service providers, events, scripts</p>
        </template>
      </code-container>
    </section>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useControlStore } from "@/stores/ControlStore";

const ctx = useControlStore();

const prisma       = ctx.dict["prisma"]              || {};
const setup        = ctx.dict["prisma-setup"]        || {};
const query        = ctx.dict["prisma-query"]        || {};
const modelMethod  = ctx.dict["prisma-model-method"] || {};

const codeOpts  = { lang: "ts", theme: "vitesse-dark" };
const shellOpts = { lang: "bash", theme: "vitesse-dark" };

// PrismaOptions config fields (client, schema, useDynamicPrismaClient, globals)
const configItems = reactive(
  ["prisma-client", "prisma-schema", "prisma-udpc", "prisma-globals"]
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
