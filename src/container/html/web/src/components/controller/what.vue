<template>
  <section class="section">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <span>
          <hook id="controller" />
          {{ controller.label }}
        </span>
      </div>
      <small>
        <span class="subtitle">{{ controller.sublabel }}</span>
      </small>
    </div>
    <span class="sub-text">
      Handles incoming request and client response, Controllers are the process in between the logic of an endpoint. Chasi Controllers also prefetches the collection of  <tag v-bind="{ name: 'Model', style: 'is-link' , reference: 'db-model'}" /> and 
      <tag v-bind="{ name: 'ServiceProvider', style: 'is-primary', reference: 'ServiceProvider' } " />, to be easily accessible inside a controller instance.
    </span>
  </section>
  <section class="section">
    <div class="x-center is-size-5">
      <span>
        <hook id="example-usage" />
        Example usage of a controller
      </span>
    </div>
    <small class="sub-text">
      <hook id="usage-namespace" /> 
      In this scenario, "user" endpoints is exposed and will be declared in a router namespace
      e.g. in [./container/http/api.js] with a prefix set to "/api", and wrapped in a route group configured 
      to use a prefix set to "/user" and a controller using a shorthand syntax. Assuming it will run on local env.
    </small>
    <code-container mapping="controller/implementation/router" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> Namespace[/container/http/api.js] </p>
      </template>
      <template v-slot:notes>
        <p> RouteGroup using shorthand syntax "@UserController" </p>
      </template>
    </code-container>
    <small class="sub-text">
      The namespace above will register 5 endpoints, the endpoints might look similar to each other, but it is under different 
      <tag v-bind="{ name: 'HTTPMethod', style: 'is-primary', reference: 'HTTPMethod' } " />. Listed below is the exposed endpoints:
      <ul>
        <li>[POST] http://localhost:3010/api/user</li>
        <li>[GET] http://localhost:3010/api/user</li>
        <li>[GET] http://localhost:3010/api/user/[userId]</li>
        <li>[PATCH] http://localhost:3010/api/user/[userId]</li>
        <li>[DELETE] http://localhost:3010/api/user[userId]</li>
      </ul>
    </small>
  </section>

  <section class="section">
    <div class="x-center is-size-5">
      <span>
        <hook id="usage-controller" /> 
        Controller 
      </span>
    </div>
    <small class="sub-text">
      The enpoints declared above will be routed to this controller[UserController]. let's assume the file will exist on [./container/controllers/UserController.ts]
    </small>
    <code-container mapping="controller/implementation/controller" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> Controller[./container/controllers/UserController.ts] </p>
      </template>
      <template v-slot:notes>
        <p> UserController </p>
      </template>
    </code-container>
  </section>

  <section class="section">
    <div class="x-center is-size-5">
      <span>
        <hook id="usage-model" /> 
        Model 
      </span>
    </div>
    <small class="sub-text">
      Let's assume that a User [./container/models/user.ts] Model will be declared as :
    </small>
    <code-container mapping="controller/implementation/model" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> Model[./container/models/user.ts] </p>
      </template>
      <template v-slot:notes>
        <p> User Model </p>
      </template>
    </code-container>
  </section>

  <list :items="data.list" :header="{ name: 'Server Request Responses', hook: 'example-responses' }" />

</template>

<script setup>
import tag from "@/components/utils/tag/tag.vue"
import {reactive} from "vue"
import { useControlStore } from "@/stores/ControlStore"
let ctx = useControlStore();
const controller = ctx.dict["controller"]
const data = reactive({
  list: [
  {
      hook: "res-post",
      title: "[POST]",
      sub: "/api/user",
      desc: `
<small>Let's assume the request to the endpoint will have this JSON body</small>
<pre style = "border-radius: 10px">
body: {
    "email": "john@doe.com",
    "alias": "jdoe",
    "password": "********",
    "name": "john doe"
}</pre>`,
      codeContent: {
        mapping: `
{
  "name": "john doe",
  "password": "$2a$08$Y5Yu87QiDJHnCr0cSmitHuoYiO5aqTw.Tt8p4.dfp57OOt.GtTDny",
  "alias": "jdoe",
  "email": "john@doe.com",
  "_id": "6631bbf3203a0c96ec409167",
  "__v": 0
}`,
        comment: `Example Server Response:`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "res-get",
      title: "[GET]",
      sub: "/api/user",
      desc: `<small>Get the list of all users</small>`,
      codeContent: {
        mapping: `
[
  {
      "_id": "6631bbf3203a0c96ec409167",
      "name": "john doe",
      "password": "$2a$08$Y5Yu87QiDJHnCr0cSmitHuoYiO5aqTw.Tt8p4.dfp57OOt.GtTDny",
      "alias": "jdoe",
      "email": "john@doe.com",
      "__v": 0
  }
]`,
        comment: `Example Server Response:`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "res-get-user",
      title: "[GET]",
      sub: "/api/user/:user",
      tag: "<user>",
      desc: `<small>If a dynamic route matches a model name, Chasi will try to resolve the index and will add a variable to the <Request> param with a prefix of "__" + the dynamic route name. like on this example, user exist as a model, Chasi will automatically bind the user to the <Request> param accesible in the controller. you can check how to use this binding in the controller displayed above.</small>`,
      codeContent: {
        mapping: `
{
  "_id": "6631bbf3203a0c96ec409167",
  "name": "john doe",
  "password": "$2a$08$Y5Yu87QiDJHnCr0cSmitHuoYiO5aqTw.Tt8p4.dfp57OOt.GtTDny",
  "alias": "jdoe",
  "email": "john@doe.com",
  "__v": 0
}`,
        comment: `Example Server Response: [GET] http://localhost:3010/api/user/6631bbf3203a0c96ec409167`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "res-patch-user",
      title: "[PATCH] ",
      sub: "/api/user/:user",
      tag: "<user>",
      desc: `<small>Update a user, in this case we'll choose to update the alias</small>
<pre style = "border-radius: 10px">
body: {
    "alias": "johnd"
}</pre>`,
      codeContent: {
        mapping: `
{
  "name": "john doe",
  "password": "$2a$08$Y5Yu87QiDJHnCr0cSmitHuoYiO5aqTw.Tt8p4.dfp57OOt.GtTDny",
  "alias": "jdoe",
  "email": "john@doe.com",
  "_id": "6631bbf3203a0c96ec409167",
  "__v": 0
}`,
        comment: `[PATCH] /api/user/6631bbf3203a0c96ec409167`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "res-del-user",
      title: "[DELETE]",
      sub: "/api/user/:user",
      tag: "<user>",
      desc: `<small></small>`,
      codeContent: {
        mapping: `
{
  "name": "john doe",
  "password": "$2a$08$Y5Yu87QiDJHnCr0cSmitHuoYiO5aqTw.Tt8p4.dfp57OOt.GtTDny",
  "alias": "jdoe",
  "email": "john@doe.com",
  "_id": "6631bbf3203a0c96ec409167",
  "__v": 0
}
        `,
        comment: `[DELETE]  /api/user/6631bbf3203a0c96ec409167`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
]});
</script>

<style  scoped>
section > .inline-separator {
  height:50px;
}

</style>