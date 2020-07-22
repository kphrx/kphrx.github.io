<template>
  <transition name="collapse-animation" @enter="addHeight" @after-enter="removeHeight" @before-leave="addHeight" @after-leave="removeHeight">
  <div v-show="expanded" class="collapse-animation">
    <slot />
  </div>
  </transition>
</template>


<script lang="ts">
import CollapseAnimation from './animation';

export default class CollapseSoft extends CollapseAnimation {}
</script>

<style src="./animation.css" scoped></style>
