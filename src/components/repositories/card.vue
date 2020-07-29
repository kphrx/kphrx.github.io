<template>
  <div class="repo-card">
    <a class="name" :href="url" v-text="name"></a>
    <p class="desc" v-text="desc"></p>
    <p class="small" v-text="updatedOn"></p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

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
  padding: .5rem;
  border: 1px solid var(--color);
  border-radius: .3rem;
  width: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .name {
    color: var(--accent-color);
    text-decoration: none;
    font-size: 1.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  .desc {
    margin: .2rem 0;
    flex: auto;
    font-size: .8rem;
  }

  .small {
    margin: .45rem 0 0;
    font-size: .75rem;
  }
}
</style>
