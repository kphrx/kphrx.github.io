<template>
  <transition name="collapse-animation" @enter="addHeight" @after-enter="removeHeight" @before-leave="addHeight">
  <div v-if="expanded" class="collapse-animation">
    <slot />
  </div>
  </transition>
</template>

<script lang="ts">
import CollapseAnimation from './animation';

export default class CollapseHard extends CollapseAnimation {}
</script>

<style src="./animation.css" scoped></style>
