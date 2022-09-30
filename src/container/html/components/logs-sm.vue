<template>
  <div> 
    <div class = "grid-clip-right-sm">
        <span>ChangeLog</span>
        <small class = "text-dark">
          <i>BetaVer :</i><strong>[0.2.0]</strong>
        </small>
    </div>
    <section class = "section-text-md shadow-inset-1" style = "text-align:left; padding: 10px">
      Rest API, modeled after MVC frameworks. The project intends to support coding standards, dynamic modularization, flexible and scalable.
      Chasi's goal is to support the full automation of a project, from Development ~ Tests ~ Production, 
      which is why codes is somehow strictly organized or atleas should be declared if changed.
      This release includes: 
      <ul style = "padding: 5px">
        <li>• Server</li>
        <li>• Database</li>
        <li>• Middlewares</li>
        <li>• Controller</li>
        <li>• View[Nuxt]</li>
        <li>• Events</li>
        <li>• SocketServer <small><i>[@v0.2.0]</i></small></li>
      </ul>
    </section>
  </div>
</template>
<script>
export default {
  name: "logs-sm"
}
</script>