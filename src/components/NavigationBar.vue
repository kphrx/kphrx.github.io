<template>
  <div class="navigation-bar">
    <router-link class="brand" :to="brandLink || {}" v-text="brandName" />
    <a class="collapse-toggle" @click="expanded = !expanded" :class="{ expanded }"></a>
    <collapse-soft class="nav-items" :expanded="expanded">
      <slot name="collapse" />
    </collapse-soft>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { RawLocation } from 'vue-router'
import CollapseSoft from '@/components/Collapse/Soft.vue'

@Component({
  components: {
    CollapseSoft,
  }
})
export default class NavigationBar extends Vue {
  @Prop({ type: String })
  brandName!: string

  @Prop({ type: [String, Object] as PropType<RawLocation>, required: true })
  brandLink!: RawLocation

  expanded = false
}
</script>

<style lang="postcss" scoped>
.collapse-toggle::before {
  content: '↓';

  .expanded& {
    content: '↑';
  }
}
.navigation-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color);
  background-color: var(--accent-color);
  overflow-y: hidden;

  >>> a {
    margin: 0;
    padding: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1.5rem;
    text-decoration: none;
    color: var(--color);

    &.router-link-exact-active {
      color: var(--bg-color);
    }
  }

  .nav-items {
    flex-basis: 100%;
    flex-grow: 1;
    align-items: center;
    display: flex;
    flex-direction: column;

    >>> a.nav-item {
      padding: .5rem;
    }
  }

  a.brand {
    font-size: 1.4rem;
    filter: contrast(175%);

    &.router-link-exact-active {
      color: var(--color);
    }
  }
}
</style>
