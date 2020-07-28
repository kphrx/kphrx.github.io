<template>
  <div class="github-repos">
    <div class="source-repos">
      <a class="collapse-button" @click="collapse.source ^= 1">
        Source Repos
      </a>
      <collapse-hard :expanded="!!collapse.source">
        Source Repos
      </collapse-hard>
    </div>
    <div class="orgs-repos">
      <a class="collapse-button" @click="collapse.orgs ^= 1">
        Organizations Repos
      </a>
      <collapse-hard :expanded="!!collapse.orgs">
        Organizations Repos
      </collapse-hard>
    </div>
    <div class="forked-repos">
      <a class="collapse-button" @click="collapse.forked ^= 1">
        Forked Repos
      </a>
      <collapse-hard :expanded="!!collapse.forked">
        Forked Repos
      </collapse-hard>
    </div>
    <div class="gists">
      <a class="collapse-button" @click="collapse.gists ^= 1">
        GitHub Gists
      </a>
      <collapse-hard :expanded="!!collapse.gists">
        GitHub Gists
      </collapse-hard>
    </div>
    <noscript>
      <details class="source-repos">
        <summary class="collapse-button">Source Repos</summary>
        Source Repos
      </details>
      <details class="orgs-repos">
        <summary class="collapse-button">Organizations Repos</summary>
        Organizations Repos
      </details>
      <details class="forked-repos">
        <summary class="collapse-button">Forked Repos</summary>
        Forked Repos
      </details>
      <details class="gists">
        <summary class="collapse-button">GitHub Gists</summary>
        GitHub Gists
      </details>
    </noscript>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CollapseHard from '@/components/Collapse/Hard.vue'

@Component({
  components: {
    CollapseHard,
  },
  head: {
    noscript: {
      id: 'RepositoriesGitHub',
      style: [
        {
          type: 'text/css',
          inner: `
.github-repos details {
  list-style: none;
}
.github-repos details::-webkit-details-marker,
.github-repos .source-repos:not(details),
.github-repos .orgs-repos:not(details),
.github-repos .forked-repos:not(details),
.github-repos .gists:not(details) {
  display: none;
}`,
        },
      ],
    },
  },
})
export default class RepositoriesGitHub extends Vue {
  created() {
    return
  }

  collapse = {
    source: 0,
    forked: 0,
    orgs: 0,
    gists: 0,
  }
}
</script>

<style scoped>
.github-repos {
  text-align: initial;
}

.collapse-button {
  display: block;;
  color: var(--color);
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}
</style>
