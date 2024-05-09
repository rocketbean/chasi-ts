<template>
  <section class="section">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <span>
          <hook id="db-model" />
          {{ model.label }}
        </span>
      </div>
      <small>
        <span class="subtitle">{{ model.sublabel }}</span>
      </small>
    </div>
    <span class="sub-text">

      Chasi Model wraps and extends Mongoose Model, and will inherit mongoose model methods. Chasi Model also can handle different database connections by specifying the name of the connection to use <tag v-bind="{ name: 'DatabaseConfig.connections', style: 'is-primary', reference: 'dc-connections' } " /> in the model.

    </span>
    <inline-separator margin = "lg" style = "height: 40px"/>
    <div class="pan-title">
      <div class="x-center is-size-5">
        <span>
          <hook id="db-model-con" />
          Specifying a connection
        </span>
      </div>
      <small>
        For multiple database connection, a connection can be specified by adding a third argument in the Model.connect() wrapper. please note that models will connect to the default connection if none is specified.
      </small>
    </div>
    <code-container :mapping="modelConScript" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> Model Instance  </p>
      </template>
    </code-container>
  </section>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
let ctx = useControlStore();
const model = ctx.dict["db-model"]
const modelConScript = `

/**
 * Model.connect
 * @param ModelName <string>
 * @param schema <mongoose.Schema>
 * @param connectionName <string | null>
 */
export default Model.connect(
  ModelName: string, 
  userSchema: mongoose.Schema, 
  connectionName: string | null
);
`
</script>