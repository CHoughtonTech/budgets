<template>
  <div class="icon-wrapper">
    <slot name="pre"></slot>
    <svg class="icon" :width="width" :height="height">
      <use v-bind="{ 'xlink:href': '/feather-sprite.svg#' + name }" />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
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
    }
  }
};
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  color: lightgrey;
  font-size: 1rem;
  font-weight: 600;
}
.icon {
  stroke: lightgrey;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  margin-right: 6px;
}
</style>
