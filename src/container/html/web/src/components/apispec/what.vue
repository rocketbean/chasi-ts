<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="apispec" />
            {{ apispec.label }}
          </span>
        </div>
        <small><span class="subtitle">{{ apispec.text }}</span></small>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="apispecConfig" />
            {{ config.label }}
          </span>
        </div>
        <small class="sublabel-text">{{ config.sublabel }}</small>
        <p class="sub-text">{{ config.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in configProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-info is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="apispecSchemas" />
            {{ schemas.label }}
          </span>
        </div>
        <p class="sub-text">{{ schemas.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in schemaProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-info is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>

      <div class="schema-table mt-4">
        <p class="is-size-6 has-text-weight-semibold mb-2">Schema key formats by driver</p>
        <table class="table is-bordered is-striped is-narrow is-fullwidth">
          <thead>
            <tr>
              <th>Driver</th>
              <th>plain (default)</th>
              <th>prefixed</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>MongoDB</td><td>user</td><td>test:user</td></tr>
            <tr><td>Prisma</td><td>User</td><td>mysql:User</td></tr>
            <tr><td>Drizzle</td><td>properties</td><td>pg:properties</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="apispecRoutes" />
            {{ routes.label }}
          </span>
        </div>
        <p class="sub-text">{{ routes.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in routeProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-info is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="apispecExample" />
            {{ example.label }}
          </span>
        </div>
      </div>
      <div class="code-block">
        <pre><code>{{ exampleCode }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import hook from "@/components/utils/hook.vue"

const ctx = useControlStore()
const d = (id) => ctx.dict[id] ?? { label: id, text: '', sublabel: '' }

const apispec   = d("apispec")
const config    = d("apispecConfig")
const schemas   = d("apispecSchemas")
const routes    = d("apispecRoutes")
const example   = d("apispecExample")

const configProps  = ["asc-enabled","asc-output","asc-definition","asc-components","asc-security","asc-schemas"].map(d)
const schemaProps  = ["asm-keyformat","asm-drivers","asm-models"].map(d)
const routeProps   = ["asr-spec","asr-security","asr-tags","asr-middlewares"].map(d)

const exampleCode = `// src/container/http/api.ts
route.group({ prefix: "/users" }, () => {

  route.post("/signup", "v1/UserController@create", {
    spec: {
      summary: "Register a new user",
      security: [],                    // public route — no JWT
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name:     { type: "string" },
                email:    { type: "string", format: "email" },
                password: { type: "string", format: "password", minLength: 6 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Created user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/test:user" },
            },
          },
        },
        400: { description: "Email already exists" },
      },
    },
  });

});

// src/config/apispec.ts
schemas: {
  keyFormat: "prefixed",              // test:user, pg:properties, mysql:User
  drivers: { exclude: ["test"] },     // skip the test DB
  models: {
    pg: { exclude: ["users", "userApps"] },
  },
}`
</script>

<style scoped>
.glossary-list    { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.glossary-item    { padding: 10px 14px; border-left: 3px solid #3273dc; background: rgba(50,115,220,.04); border-radius: 4px; }
.item-label       { font-weight: 600; font-size: .95rem; }
.item-type        { margin-left: 8px; font-family: monospace; font-size: .75rem; }
.sublabel-text    { color: #888; font-size: .8rem; display: block; margin-bottom: 4px; }
.code-block       { background: #1e1e2e; border-radius: 8px; padding: 20px; overflow-x: auto; }
.code-block pre   { color: #cdd6f4; font-size: .82rem; margin: 0; }
.schema-table     { overflow-x: auto; }
</style>
