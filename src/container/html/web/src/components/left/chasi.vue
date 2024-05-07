<template>
  <div class="card  glass">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img
              src="/src/assets/logo-s.svg"
              alt="Placeholder image"
              class = "curved-border"
            />
          </figure>
        </div>
        <div class="media-content ">
          <p class="title is-5 text-light">Chasi-TS</p>
          <p class="subtitle is-7 has-text-grey-light">@rocketbean</p>
        </div>
      </div>
      <div class="content">
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import logoUrl from "@/assets/logo.png"

console.log(logoUrl)
export default defineComponent({
  name: "chasi",
  mounted() {
  }
})
</script>

<style scoped>
.card {
  margin-bottom:0px !important;
}

</style>
