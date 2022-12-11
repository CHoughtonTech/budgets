<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'BaseIcon',
  props: {
    name: String,
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    style: {
      type: String,
      default: null
    }
  }
})
</script>
<template>
  <div :class="$style['icon-wrapper']">
    <slot name="pre"></slot>
    <svg :class="$style['icon-base']" :width="width" :height="height">
      <use v-bind="{ 'xlink:href': '/feather-sprite.svg#' + name }" />
    </svg>
    <slot></slot>
  </div>
</template>
<style lang="scss" module>
.icon-wrapper {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  font-size: var(--icon-font-size, 1rem);
  font-weight: 600;
}
.icon-base {
  stroke: var(--icon-stroke, #{$light-gray});
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: var(--icon-fill, none);
  margin-left: 6px;
  margin-right: 6px;
}
</style>
