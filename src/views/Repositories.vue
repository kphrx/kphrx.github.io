<template>
  <div class="repositories">
    <h1>Git Public Repositories</h1>
    <repos-github />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import RepositoriesGitHub from '@/components/repositories/github.vue'

@Component({
  head: {
    title: { inner: 'Git Public Repositories' }
  },
  components: {
    'repos-github': RepositoriesGitHub,
  },
})
export default class Repositories extends Vue {}
</script>

<style scoped>
.repositories {
  margin: 1rem;

  h1 {
    margin-top: 0;
  }
}
</style>
