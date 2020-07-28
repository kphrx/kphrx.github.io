<template>
  <div class="github-repos">
    <div class="source-repos">
      <a class="collapse-button" @click="collapse.source ^= 1">
        Source Repos
      </a>
      <collapse-hard :expanded="!!collapse.source && sourceRepos.length > 0">
        <div class="repos">
          <div class="repo" v-for="repo in sourceRepos" :key="repo.url">
            <p v-text="repo.owner.login == username ? repo.name : repo.nameWithOwner"></p>
            <p>Updated on {{ timeAgoFromDate(updatedAt(repo)) }}</p>
          </div>
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link"><a href="https://github.com/kPherox?tab=repositories&type=source" target="_blank" rel="noopenner">https://github.com/kPherox?tab=repositories&type=source</a></p>
      </noscript>
    </div>
    <div class="orgs-repos">
      <a class="collapse-button" @click="collapse.orgs ^= 1">
        Organizations Repos
      </a>
      <collapse-hard :expanded="!!collapse.orgs && orgsRepos.length > 0">
        <div class="repos">
          <div class="repo" v-for="repo in orgsRepos" :key="repo.url">
            <p v-text="repo.nameWithOwner"></p>
            <p>Updated on {{ timeAgoFromDate(updatedAt(repo)) }}</p>
          </div>
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link">From: <a href="https://github.com/kPherox" target="_blank" rel="noopenner">https://github.com/kPherox</a></p>
      </noscript>
    </div>
    <div class="forked-repos">
      <a class="collapse-button" @click="collapse.forked ^= 1">
        Forked Repos
      </a>
      <collapse-hard :expanded="!!collapse.forked && forkedRepos.length > 0">
        <div class="repos">
          <div class="repo" v-for="repo in forkedRepos" :key="repo.url">
            <p v-text="repo.owner.login == username ? repo.name : repo.nameWithOwner"></p>
            <p>Updated on {{ timeAgoFromDate(updatedAt(repo)) }}</p>
          </div>
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link"><a href="https://github.com/kPherox?tab=repositories&type=fork" target="_blank" rel="noopenner">https://github.com/kPherox?tab=repositories&type=fork</a></p>
      </noscript>
    </div>
    <div class="gists">
      <a class="collapse-button" @click="collapse.gists ^= 1">
        GitHub Gists
      </a>
      <collapse-hard :expanded="!!collapse.gists && gists.length > 0">
        <div class="repos">
          <div class="repo" v-for="gist in gists" :key="gist.url">
            <p v-text="gist.files[0].name"></p>
            <p>Updated on {{ timeAgoFromDate(updatedAt(gist)) }}</p>
          </div>
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link"><a href="https://gist.github.com/kPherox" target="_blank" rel="noopenner">https://gist.github.com/kPherox</a></p>
      </noscript>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ClientError } from 'graphql-request'
import GitHubGraphQL, { Gist, Repository, UserRepository, OrganizationRepository } from '@/modules/graphql/github'
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
          inner:
            `.github-repos .repos-link {
              font-weight: bold;
            }`
        }
      ],
    },
  }
})
export default class RepositoriesGitHub extends Vue {
  async created() {
    const client = new GitHubGraphQL(process.env.GITHUB_ACCESS_TOKEN)
    try {
      const data = await client.fetchAll()
      this.username = data.login
      this.repos.source = data.repositories.nodes.filter(repo => !repo.isFork)
      this.repos.forked = data.repositories.nodes.filter(repo => repo.isFork)
      this.repos.orgs = data.organizations.nodes.flatMap(org => org.repositories.nodes)
      this.repos.gists = data.gists.nodes
    } catch (e) {
      this.error = e
    }
    return
  }

  collapse = {
    source: 1,
    orgs: 0,
    forked: 0,
    gists: 0,
  }

  error: ClientError | null = null

  username = ''

  repos = {
    source: [] as UserRepository[],
    orgs: [] as OrganizationRepository[],
    forked: [] as UserRepository[],
    gists: [] as Gist[],
  }

  get sourceRepos() {
    return this.repos.source.sort(this.compareUpdatedAt)
  }

  get orgsRepos() {
    return this.repos.orgs.sort(this.compareUpdatedAt)
  }

  get forkedRepos() {
    return this.repos.forked.sort(this.compareUpdatedAt)
  }

  get gists() {
    return this.repos.gists.sort(this.compareUpdatedAt)
  }

  timeAgoFromDate(d: Date) {
    const e = Date.now() - d.getTime()
      , t = Math.round(e / 1e3)
      , n = Math.round(t / 60)
      , r = Math.round(n / 60)
      , o = Math.round(r / 24)

    switch (true) {
      case e < 0 || t < 0:
        return "just now"
      case t < 45:
        return `${t} seconds ago`
      case t < 90:
        return "a minute ago"
      case n < 45:
        return `${n} minutes ago`
      case n < 90:
        return "an hour ago"
      case r < 24:
        return `${r} hours ago`
      case r < 36:
        return "a day ago"
      case o < 30:
        return `${o} days ago`
      default: {
        const opts = { month: "short", day: "numeric" }
        return d.getFullYear() < new Date().getFullYear()
          ? d.toLocaleDateString("en-US", Object.assign({ year: 'numeric' }, opts))
          : d.toLocaleDateString("en-US", opts)
      }
    }
  }

  updatedAt(repo: Repository | Gist) {
    const pushedAt = new Date(repo.pushedAt)
    const updatedAt = new Date(repo.updatedAt)
    return pushedAt.getTime() > updatedAt.getTime() ? pushedAt : updatedAt
  }

  compareUpdatedAt(a: Repository | Gist, b: Repository | Gist) {
    const aUpdatedAt = this.updatedAt(a).getTime()
    const bUpdatedAt = this.updatedAt(b).getTime()
    return aUpdatedAt < bUpdatedAt ? 1
      : aUpdatedAt > bUpdatedAt ? -1
      : 0
  }
}
</script>

<style scoped>
.github-repos {
  text-align: initial;

  a {
    color: var(--accent-color);
  }

  .collapse-button {
    display: block;
    color: var(--color);
    margin: 1rem 0 0;
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
  }

  .repos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: .5rem;

    .repo {
      margin: .5rem;
      padding: .5rem;
      border: 1px solid var(--color);
      border-radius: .3rem;
      width: 320px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      > p {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
