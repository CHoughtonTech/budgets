<template>
  <div class="icon-wrapper" :style="style">
    <slot name="pre"></slot>
    <svg class="iconBase" :class="!style ? 'icon' : ''" :style="style" :width="width" :height="height">
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
    },
    style: {
      type: String,
      default: null
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
.iconBase {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  margin-left: 6px;
  margin-right: 6px;
}
.icon {
  stroke: lightgrey;
}
</style>
