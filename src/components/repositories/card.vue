<template>
  <div class="repo-card">
    <p class="name">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path v-if="forked" fill-rule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"/>
        <path v-else fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>
      <a :href="url" v-text="name"></a>
    </p>
    <p class="forked-from" v-if="forked && forked.name">
      Forked from <a :href="forked.url" v-text="forked.name"></a>
    </p>
    <p class="desc" v-text="desc"></p>
    <div class="small">
      <p class="updated-on" v-text="updatedOn"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

export type ParentRepository = {
  name: string;
  url: string | URL;
}

@Component
export default class RepositoryCard extends Vue {
  @Prop({ type: [String, URL], required: true })
  url!: string | URL
  @Prop({ type: String, required: true })
  name!: string
  @Prop({ type: String, default: '' })
  desc!: string
  @Prop({ type: Date, default: new Date() })
  updated!: Date
  @Prop({ type: Object as PropType<ParentRepository>, required: false })
  forked?: ParentRepository

  get updatedOn() {
    return `Updated on ${this.timeAgoFromDate(this.updated)}`
  }

  timeAgoFromDate(d: Date) {
    const now = new Date()
    const e = now.getTime() - d.getTime()
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
        return d.getFullYear() < now.getFullYear()
          ? d.toLocaleDateString("en-US", Object.assign({ year: 'numeric' }, opts))
          : d.toLocaleDateString("en-US", opts)
      }
    }
  }
}
</script>

<style scoped>
.repo-card {
  text-align: left;
  padding: .5rem;
  border: 1px solid var(--color);
  border-radius: .3rem;
  width: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  svg.icon {
    margin-right: .2rem;
    color: var(--color);
    fill: currentColor;
    filter: contrast(75%);
    min-width: 16px;
  }

  a {
    color: var(--accent-color);

    &:not(:hover) {
      color: var(--color);
      text-decoration: none;
    }
  }

  .name {
    display: flex;
    margin: 0;
    font-size: 1.25rem;
    align-items: center;

    > a {
      flex: auto;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--accent-color);
    }
  }

  .forked-from {
    margin: 0 0 .2rem;
    font-size: .8rem;

    > a {
      font-weight: bold;
    }
  }

  .desc {
    margin: .2rem 0;
    flex: auto;
    font-size: .85rem;
  }

  .small {
    display: flex;
    margin: .45rem 0 0;
    font-size: .75rem;

    * {
      margin: 0;
    }

    > .updated-on {
      flex: auto;
      text-align: right;
    }
  }
}
</style>
