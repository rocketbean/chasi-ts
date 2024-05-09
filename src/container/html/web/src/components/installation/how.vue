<template>
  <div >
  <section class = "section">
    <p>
      Chasi-TS framework will run on any OS that can run NodeJS process.
      Assuming the active environment meets the minimum requirements,
      you can boot-up chasi in multiple ways such as:
    </p>
    <ul>
      <li>
        npm 
      </li>
      <li>
        chasi-cli
      </li>
      <li>
        forking github repo
      </li>
    </ul>
  </section>

  <section class = "section" ref = "installNpm" >
    
    <h5> <hook id = "NpmInit" /> initializing npm </h5>
    <span class = "sub-text">
      This is the most recommended way of initializing chasi, 
      please note that this step requires 
      node, npm and git installed in your environment.
    </span>
    <code-container  mapping = "installation/npm">
    </code-container>
  </section>

  <section class = "section" >
    <h5> <hook id = "chasiInstall" /> via chasi-cli </h5>
    <span class = "sub-text">
      This requires chasi-cli to be globally installed on your system.
    </span>
    <code-container mapping = "installation/installcli" >
      <template v-slot:comment>
          <p > *installing chasi-cli</p>
      </template>
    </code-container>
    <code-container mapping = "installation/cli" >
      <template v-slot:comment>
          <p >//initializing chasi via cli</p>
      </template>
      <template v-slot:notes>
        <small >
          this will ask a bunch of questions but your can set it all as default values by hitting <strong>enter</strong>
        </small>
    </template>
    </code-container>
  </section>

  <section class = "section last-section" ref = "installGithub">
    
    <h5> <hook id = "Github" /> Github </h5>
    <div class="notification is-dark">
      <span class = "sub-text">
        You can headover to the 
        <a href = "https://github.com/rocketbean/chasi-ts" class = "tag is-link" target="_new">chasi-ts</a> github page,
        and fork it in your github or use chasi-ts as a template
      </span>
    </div>
  <hr/>
  </section>
</div>
</template>

<script lang = "ts" setup>
import { ref,  onMounted } from "vue";
onMounted(() => {
})

</script>

<style lang="scss" scoped>

</style>