<template>
  <div> 
    <div class = "grid-clip-right-sm">
        <span class = "">ChangeLog</span>
        <small class = "text-light">
          <i>BetaVer :</i><strong >[0.2.1]</strong>
        </small>
    </div>
    <section class = "section-text-md shadow-inset-1" style = "text-align:left; padding: 10px">
      <div class="tabs is-medium">
        <ul>
          <li class = "text-light"><a @click = "activateTab()">Server</a></li>
          <li class = "text-light"><a @click = "activateTab()">Databases</a></li>
          <li class = "text-light"><a @click = "activateTab()">Controllers</a></li>
          <li class = "text-light"><a @click = "activateTab()">Clusters</a></li>
          <li class = "text-light"><a @click = "activateTab()">Views</a></li>
          <li class = "text-light"><a @click = "activateTab()">Events</a></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "logs-wide",
  methods: {
    activateTab(tab)  {
      console.log(tab, "@tab")
    }
  }
}
</script>
