<template>
  <div>
    <section class="hero is-medium gradient-background"
      style="border-top-left-radius: 10px;border-top-right-radius: 10px; overflow:hidden; z-index: 10;">
      <div class="hero-body"
        style="display: grid; grid-template-columns: auto 1fr; position:relative; z-index: 5; overflow:hidden">
        <div style="display:grid; place-items: start">
          <div class="" style="border-radius: 4px; padding:10px; background:rgba(0,0,21,0.5)">
            <p class=" title">Chasi-TS</p>
            <p class="subtitle">
              Turbo-charge your app</p>
          </div>

        </div>
        <div style="display: grid; place-items: center; max-height: 100px; ">
          <header-animation />
        </div>
      </div>
    </section>
    <div class="content" style="padding:20px; margin-top:10px">
      <hr style="color:white" />
      <p class="margin:20px">
        A Rest-API framework that will boosts the development,
        secures the production, and ensures the scalability of your project.
        Chasi is modeled after an auto-mobile production, which may start with
        the chassis, and serve's as the car's foundation. Routing container allows chasi to manage multiple API's
        within the same cluster, supplying each their requirements from a centralized abstract environment. the 
        framework also provides an option to manage processes since NodeJS provides great flexibility on managing performance via it's Cluster API, therefore improving scalabilty accross the project. 
      </p>
      <h4>Requirements</h4>
      <ul class="is-size-6">
        <li>Node (>=v16.0.0)</li>
        <li>NPM (>=v8.0.0)</li>
        <li>Git (>=2.0.0)</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import headerAnimation from "./header-animation.vue";
export default defineComponent({
  name: "intro",
  components: {
    'header-animation': headerAnimation
  },
  data () {
    return {
      
    }
  },
  mounted() {
  }
}

)
</script>
<style>
.function-based-values-demo {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  width: 290px;
  height: 100%;
}

.el {
  position: relative;
  margin: 5px;
  height: 20px;
  width: 20px;
  background: black;
}
</style>