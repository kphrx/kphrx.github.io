<template>
  <div class="not-found">
    <h1 v-text="title"></h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  head: {
    title() {
      return { inner: (this as NotFound).title }
    }
  }
})
export default class NotFound extends Vue {
  title = '404 Not Found'
}
</script>
