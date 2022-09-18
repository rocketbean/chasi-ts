<template>
  <div>
    <router-view v-slot="{ Component }">
      <Suspense>
        <div>
          <component :is="Component" ></component>
        </div>
      </Suspense>
    </router-view>
  </div>
</template>

<style>
@font-face {
  font-family: 'Inter';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url('./assets/fonts/Inter-Italic.woff2#iefix') format('woff2'),
    url('./assets/fonts/Inter-Italic.woff') format('woff');
}
.inter {
  font-family: 'Inter';
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>