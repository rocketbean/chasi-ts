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
      <code-container mapping="testing/usage/initial" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <span> - using supertest, we can invoke requests to the app. </span>
          <span> - we needed to extract the server instance to the app, we can do it by extracting $app.$server to the Chasi instance.</span>
        </template>
        <template v-slot:notes>
          <p> ./test/user.test.ts </p>
        </template>
      </code-container>
      <br/>
      <span class="sub-text">
        Assume that we have an endpoint, controller, and model setup for handling User, and a controller method for creating a user.
      </span>
      <code-container mapping="testing/usage/signup" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <span> - let's say we wanted to setup a test for signup</span>
          <span> - we wanted to test a successful creation of a user with a simple property like [name, email, alias, password]</span>
        </template>
        <template v-slot:notes>
          <p> ./test/user.test.ts </p>
        </template>
      </code-container>
      <br/>
      <span class="sub-text">
        Let's add more test, Assume that we have a login method that authenticates a user and generates a token.
      </span>
      <code-container mapping="testing/usage/signin" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <span> - let's add more test to our user login.</span>
          <span> - assume we have an error handler that returns 422 for missing params.</span>
          <span> - assume we return user object and a generated JWT token, for successful login.</span>
        </template>
        <template v-slot:notes>
          <p> ./test/user.test.ts </p>
        </template>
      </code-container>
      <br/>
      <span class="sub-text">
        Let's add beforeAll call that drops the User collection, so we can ensure we always have a fresh data on test.
        This is also to avoid having an error if we have some unique values setup on our Model.
      </span>
      <code-container mapping="testing/usage/addBeforeAll" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:notes>
          <p> ./test/user.test.ts </p>
        </template>
      </code-container>
      <br/>
      <span class="sub-text">
        Let's run our test.
      </span>
      <code-container mapping="testing/usage/onSuccessTest" :options="{ theme: 'vitesse-dark', lang: 'shell' }">
        <template v-slot:comment>
          <p> - run: "npm run test"</p>
          <p> - we should see something like this.</p>
        </template>
        <template v-slot:notes>
          <p> $terminal </p>
        </template>
      </code-container>
    </section>
  </div>
</template>
<script setup>
import { useControlStore } from "@/stores/ControlStore"
let ctx = useControlStore();
const env = ctx.dict["tst-usage"]
console.log(env, "@env")
</script>