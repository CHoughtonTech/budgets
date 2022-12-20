<script>
import { defineComponent } from 'vue';
import BaseIcon from './BaseIcon.vue';
export default defineComponent({
    components: {
        BaseIcon,
    },
    name: 'BaseIcon',
    props: {
        source: String,
        size: {
            type: String,
            default: 'small',
        },
    },
    computed: {
        hasNoSource() {
            return this.source === null || this.source === '';
        },
    }
})
</script>
<template>
    <div>
        <BaseIcon v-if="hasNoSource" name="user" />
        <div v-else :class="$style['media-wrapper']">
            <div :class="$style['media-content']">
                <div :class="[$style['media-item'], size && $style[size]]" >
                    <img :class="$style['media-image']" :src="source">
                </div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss" module>
.media-wrapper {
  display: flex;
  align-items: flex-start;
}
.media-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.media-item {
    display: flex;
    align-self: flex-start;
    position: relative;
    &.small {
        width: 24px;
        height: 24px;
    }
    &.medium {
        width: 32px;
        height: 32px;
    }
    &.large {
        width: 48px;
        height: 48px;
    }
    &.x-large {
        width: 64px;
        height: 64px;
    }
    &.xx-large {
        width: 128px;
        height: 128px;
    }
    &.xxx-large {
        width: 256px;
        height: 256px;
    }
}
.media-image {
    width: 100%;
    border: 0;
    margin: 0;
    padding: 0;
    border-radius: 100%;
}
</style>
