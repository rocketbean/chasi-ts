<template>
  <div>
    <div class="panel-block">
      <p class="control has-icons-left has-icons-right">
        <span class="icon is-small material-symbols-rounded is-left">
          search
        </span>
        <input class="input " type="text" placeholder="Search" />

      </p>
    </div>
    <a class="panel-block is-active has-text-light is-size-7">
      <span class="material-symbols-rounded">
        chevron_right
      </span>
      config
    </a>
    <a class="panel-block has-text-light is-size-7">
      <span class="material-symbols-rounded">
        chevron_right
      </span>
      environment
    </a>
    <a class="panel-block is-size-7">
      <span class="material-symbols-rounded ">
        chevron_right
      </span>
      ServiceCluster
    </a>
    <a class="panel-block has-text-light is-size-7">
      <span class="material-symbols-rounded">
        chevron_right
      </span>
      hooks
    </a>
  </div>
</template>

<script lang = "ts">
import { defineConfig } from "vite";

export default {}
</script>