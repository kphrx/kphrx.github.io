<template>
  <div id="app">
    <navigation-bar id="nav" :brand-name="projectName" :brand-link="{ name: 'root' }">
      <template v-slot:collapse>
        <router-link class="nav-item" :to="{ name: 'about' }">About</router-link>
        <router-link class="nav-item" :to="{ path: '/products' }">Products</router-link>
        <router-link class="nav-item" :to="{ path: '/repositories' }">Repositories</router-link>
      </template>
    </navigation-bar>
    <router-view id="view" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NavigationBar from './components/NavigationBar.vue'

@Component({
  components: {
    NavigationBar,
  }
})
export default class App extends Vue {
  projectName = process.env.PROJECT_NAME
}
</script>

<style>
:root {
  --color: #2c3e50;
  --accent-color: #42b983;
  --bg-color: #e5e6e4;

  @media (prefers-color-scheme: dark) {
    --color: #f6f9c9;
    --accent-color: #1fa66c;
    --bg-color: #1e1f1b;
  }
}

body {
  margin: 0;
  color: var(--color);
  background-color: var(--bg-color);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
}

#nav {
  flex-direction: row;
  position: sticky;
  top: 0;
  text-align: left;

  @media (min-width: 592px) {
    overflow-y: auto;
    height: auto;
    > .collapse-toggle {
      display: none;
    }
    > .nav-items {
      flex: auto;
      display: flex !important;
      flex-direction: row;
    }
  }

  @media (min-width: 768px) {
    flex-direction: column;
    text-align: center;
    height: 100vh;
    > .nav-items {
      flex-direction: column;
      width: 100%;
    }
  }
}

#view {
  flex: auto;
}
</style>
