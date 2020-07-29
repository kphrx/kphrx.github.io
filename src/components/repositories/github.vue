<template>
  <div class="github-repos">
    <div class="source-repos">
      <a class="collapse-button" @click="collapse.source ^= 1">
        Source Repos
        <span class="badge" v-text="sourceRepos.length"></span>
      </a>
      <collapse-hard :expanded="!!collapse.source && sourceRepos.length > 0">
        <div class="repos">
          <repo-card
            v-for="repo in sourceRepos"
            :key="repo.url"
            :url="repo.url"
            :name="repo.owner.login == username ? repo.name : repo.nameWithOwner"
            :desc="repo.description"
            :updated="repo.updated"
          />
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link"><a href="https://github.com/kPherox?tab=repositories&type=source" target="_blank" rel="noopenner">https://github.com/kPherox?tab=repositories&type=source</a></p>
      </noscript>
    </div>
    <div class="orgs-repos">
      <a class="collapse-button" @click="collapse.orgs ^= 1">
        Organizations Repos
        <span class="badge" v-text="orgsRepos.length"></span>
      </a>
      <collapse-hard :expanded="!!collapse.orgs && orgsRepos.length > 0">
        <div class="repos">
          <repo-card
            v-for="repo in orgsRepos"
            :key="repo.url"
            :url="repo.url"
            :name="repo.nameWithOwner"
            :desc="repo.description"
            :updated="repo.updated"
            :forked="repo.parentRepository"
          />
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link">From: <a href="https://github.com/kPherox" target="_blank" rel="noopenner">https://github.com/kPherox</a></p>
      </noscript>
    </div>
    <div class="forked-repos">
      <a class="collapse-button" @click="collapse.forked ^= 1">
        Forked Repos
        <span class="badge" v-text="forkedRepos.length"></span>
      </a>
      <collapse-hard :expanded="!!collapse.forked && forkedRepos.length > 0">
        <div class="repos">
          <repo-card
            v-for="repo in forkedRepos"
            :key="repo.url"
            :url="repo.url"
            :name="repo.owner.login == username ? repo.name : repo.nameWithOwner"
            :desc="repo.description"
            :updated="repo.updated"
            :forked="repo.parentRepository"
          />
        </div>
      </collapse-hard>
      <noscript>
        <p class="repos-link"><a href="https://github.com/kPherox?tab=repositories&type=fork" target="_blank" rel="noopenner">https://github.com/kPherox?tab=repositories&type=fork</a></p>
      </noscript>
    </div>
    <div class="gists">
      <a class="collapse-button" @click="collapse.gists ^= 1">
        GitHub Gists
        <span class="badge" v-text="gists.length"></span>
      </a>
      <collapse-hard :expanded="!!collapse.gists && gists.length > 0">
        <div class="repos">
          <repo-card
            v-for="gist in gists"
            :url="gist.url"
            :key="gist.url"
            :name="gist.files[0].name"
            :desc="gist.description"
            :updated="gist.updated"
            :forked="gist.isFork ? {} : null"
          />
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
import GitHubGraphQL, { Gist, Repository, UserRepository } from '@/modules/graphql/github'
import CollapseHard from '@/components/Collapse/Hard.vue'
import RepoCard, { ParentRepository } from '@/components/repositories/card.vue'
import '@/utils/minify'

interface UpdateAt {
  updated: Date;
}

interface RepositoryExtend extends UpdateAt {
  parentRepository?: ParentRepository;
}

@Component({
  components: {
    CollapseHard,
    RepoCard,
  },
  head: {
    noscript: {
      id: 'RepositoriesGitHub',
      style: [
        {
          type: 'text/css',
          inner:
            `.github-repos .repos-link {
              margin: 0;
            }

            .github-repos .repos-link a {
              font-weight: bold;
              color: var(--accent-color);
              text-decoration: none;
            }

            .github-repos .collapse-button .badge {
              display: none !important;
            }`.minifyCSS()
        }
      ],
    },
  }
})
export default class RepositoriesGitHub extends Vue {
  async created() {
    const client = new GitHubGraphQL(process.env.GITHUB_ACCESS_TOKEN)
    const updated = <T extends Repository>(node: T) => {
      const parentRepository = node.parent ? {
        name: node.parent.nameWithOwner,
        url: node.parent.url,
      } : undefined
      const newValue: T & RepositoryExtend = {
        ...node,
        updated: this.updatedAt(node),
        parentRepository,
      }
      return newValue
    }
    try {
      const data = await client.fetchAll()
      this.username = data.login
      const repos = data.repositories.nodes.map(updated)
      this.repos.source = repos.filter(repo => !repo.isFork)
      this.repos.forked = repos.filter(repo => repo.isFork)
      this.repos.orgs = data.organizations.nodes.flatMap(org => org.repositories.nodes).map(updated)
      this.repos.gists = data.gists.nodes.map(gist => {
        const newValue: Gist & UpdateAt = {
          ...gist,
          updated: this.updatedAt(gist),
        }
        return newValue
      })
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
    source: [] as (UserRepository & RepositoryExtend)[],
    orgs: [] as (Repository & RepositoryExtend)[],
    forked: [] as (UserRepository & RepositoryExtend)[],
    gists: [] as (Gist & UpdateAt)[],
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

  updatedAt(repo: Repository | Gist) {
    const pushedAt = new Date(repo.pushedAt)
    const updatedAt = new Date(repo.updatedAt)
    return pushedAt.getTime() > updatedAt.getTime() ? pushedAt : updatedAt
  }

  compareUpdatedAt<T extends (Repository | Gist) & UpdateAt>(a: T, b: T) {
    const aUpdatedAt = a.updated.getTime()
    const bUpdatedAt = b.updated.getTime()
    return aUpdatedAt < bUpdatedAt ? 1
      : aUpdatedAt > bUpdatedAt ? -1
      : 0
  }
}
</script>

<style scoped>
.github-repos {
  text-align: initial;

  > div {
    margin: .5rem 0;
    padding: .5rem;
    border: 1px solid var(--color);
    border-radius: .3rem;
  }

  .collapse-button {
    justify-content: space-between;
    display: flex;
    color: var(--color);
    font-size: 1.5rem;
    font-weight: bold;
  }

  .repos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: .5rem;

    .repo-card {
      margin: .5rem;
    }
  }
}
</style>
