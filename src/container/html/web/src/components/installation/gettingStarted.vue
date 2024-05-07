<template>
  <div>
    <section class = "section" >
    
      <h3> <hook id = "GettingStarted" /> Getting Started </h3>
      <span class = "sub-text">
        there is a template of environment file right after installation 
        (<a class = "tag is-dark" ><i>./template.env</i></a>), which can be copied as a reference for setting up 
        a <a class = "tag is-link" >.env</a> file.
      </span>

      <code-container mapping = "gettingStarted/localBoot" :options="{theme: 'vitesse-light'}" >
        <template v-slot:comment>
            <p > *run local development environment</p>
        </template>
      </code-container>

      <code-container mapping = "gettingStarted/manualBoot" :options="{theme: 'vitesse-light'}" >
        <template v-slot:comment>
            <p > // or do it manually</p>
        </template>
      </code-container>

      <code-container mapping = "gettingStarted/manualBootNode" :options="{theme: 'vitesse-light'}" >
        <template v-slot:comment>
          <p > node ./<span class = "tag">OutputFolder</span>/server.js,</p> on the default 
          scenario, this will be 
      </template>
        <template v-slot:notes>
            <p > and this on a separate terminal </p>
        </template>
      </code-container>
    </section>
  </div>
</template>

<script>
  
</script>