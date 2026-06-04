<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="sdkbuilder" />
            {{ sdkbuilder.label }}
          </span>
        </div>
        <small><span class="subtitle">{{ sdkbuilder.text }}</span></small>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="sdkbuilderConfig" />
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
            <hook id="sdkbuilderOutput" />
            {{ output.label }}
          </span>
        </div>
        <p class="sub-text">{{ output.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in outputProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-success is-light item-type">{{ item.type }}</span>
          <small v-if="item.sublabel" class="sublabel-text">{{ item.sublabel }}</small>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
      <div class="code-block mt-4">
        <pre><code>{{ formatterExamples }}</code></pre>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="sdkbuilderSdk" />
            {{ sdkMethod.label }}
          </span>
        </div>
        <p class="sub-text">{{ sdkMethod.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in sdkProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-warning is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="sdkbuilderGenerated" />
            {{ generated.label }}
          </span>
        </div>
        <p class="sub-text">{{ generated.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in generatedProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="sdkbuilderExample" />
            {{ example.label }}
          </span>
        </div>
      </div>
      <div class="code-block">
        <pre><code>{{ exampleCode }}</code></pre>
      </div>
      <p class="sub-text mt-4">Consuming the generated bundle in a frontend app:</p>
      <div class="code-block mt-2">
        <pre><code>{{ consumerCode }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import hook from "@/components/utils/hook.vue"

const ctx = useControlStore()
const d = (id) => ctx.dict[id] ?? { label: id, text: '', sublabel: '', type: '' }

const sdkbuilder  = d("sdkbuilder")
const config      = d("sdkbuilderConfig")
const output      = d("sdkbuilderOutput")
const sdkMethod   = d("sdkbuilderSdk")
const generated   = d("sdkbuilderGenerated")
const example     = d("sdkbuilderExample")

const configProps    = ["sdb-enabled","sdb-host","sdb-output","sdb-httpClient","sdb-routers","sdb-exclude"].map(d)
const outputProps    = ["sdb-filename","sdb-formatter","sdb-terser"].map(d)
const sdkProps       = ["sdb-sdk-method","sdb-sdk-array","sdb-sdk-chain","sdb-sdk-group","sdb-sdk-router"].map(d)
const generatedProps = ["sdb-gen-structure","sdb-gen-validate","sdb-gen-request","sdb-gen-runsdk"].map(d)

const formatterExamples = `// src/config/sdkbuilder.ts

// default — terser (minify + mangle)
import { terserFormatter } from "../container/modules/SdkBuilder/formatters/terser.js"
output: { filename: "sdk/chasi.sdk.js", formatter: terserFormatter }

// uglify-js@3
import UglifyJS from "uglify-js"
output: { filename: "sdk/chasi.sdk.js", formatter: (code) => UglifyJS.minify(code).code }

// prettier (readable formatted output)
import prettier from "prettier"
output: { filename: "sdk/chasi.sdk.js", formatter: (code) => prettier.format(code, { parser: "babel" }) }

// no formatting — write raw output
output: { filename: "sdk/chasi.sdk.js" }`

const exampleCode = `// src/config/sdkbuilder.ts
export default {
  enabled: true,
  host: "http://localhost:3010",
  output: { filename: "sdk/chasi.sdk.js", formatter: terserFormatter },
  httpClient: "fetch",
  routers: ["api"],
  exclude: [{ m: "post", url: "/api/users/forget" }],
}

// src/container/http/api.ts — register sdk() on a route
route.post("/signin", "v1/UserController@signin", { spec: { ... } })
  .sdk((params, next) => {
    if (!params?.email) throw new Error("email is required")
    next()
  })

// sdk() on a group — applied to ALL routes in the group
route.group({ prefix: "/users", sdk: [validateScope] }, () => {
  route.post("/signin", ...)
  route.post("/signup", ...)
})`

const consumerCode = `// Import from generated bundle (ES module)
import { users } from "./sdk/chasi.sdk.js"
// or
import SDK from "./sdk/chasi.sdk.js"

// Public route — no token needed
const result = await users.signin({ email: "user@example.com", pass: "secret" })
console.log(result.token)

// Protected route — pass the JWT as second argument
const profile = await users.index({}, token)

// Validation runs before the request
try {
  await users.signup({ name: "Alice" })  // throws: Missing required field "email"
} catch (err) {
  console.error(err.message)
}`
</script>

<style scoped>
.glossary-list    { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.glossary-item    { padding: 10px 14px; border-left: 3px solid #48c78e; background: rgba(72,199,142,.04); border-radius: 4px; }
.item-label       { font-weight: 600; font-size: .95rem; }
.item-type        { margin-left: 8px; font-family: monospace; font-size: .75rem; }
.sublabel-text    { color: #888; font-size: .8rem; display: block; margin-bottom: 4px; }
.code-block       { background: #1e1e2e; border-radius: 8px; padding: 20px; overflow-x: auto; }
.code-block pre   { color: #cdd6f4; font-size: .82rem; margin: 0; }
</style>
