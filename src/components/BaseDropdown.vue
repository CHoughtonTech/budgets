<script>
import BaseIcon from './BaseIcon.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: {
        BaseIcon,
    },
    props: {
        menuItems: {
            type: Array,
            required: true
        },
    },
    data() {
        return {
            showMenu: false,
        }
    },
    methods: {
        menuItemSelected(item) {
            this.$emit('menu-item-selected', item);
        },
    }
});
</script>
<template>
    <div :class="$style['menu-wrapper']">
        <BaseIcon :class="$style['menu-button']" name="menu"/>
        <div :class="$style['menu-content']">
            <ul :class="$style['menu']">
                <li
                    v-for="item in menuItems"
                    :key="item.name"
                    :class="$style['menu-item']"
                    @click="menuItemSelected(item.name)"
                >
                    <BaseIcon
                        v-if="item.icon"
                        :name="item.icon"
                    >
                        {{ item.name }}
                    </BaseIcon>
                    <p
                        v-else
                    >
                        {{ item.name }}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="scss" module>
.menu-wrapper {
    display: flex;
    position: relative;
    &:hover {
        .menu-content {
            display: flex !important;
            flex-direction: column;
        }
    }
}
.menu-button {
    display: flex;
    &:hover {
        cursor: pointer;
    }
}
.menu {
    list-style: none;
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    border-radius: 10px;
    .menu-item {
        padding: 5px 10px;
        &:first-child {
            padding-top: 10px;
            border-radius: 8px 8px 0 0;
        }
        &:last-child {
            padding-bottom: 10px;
            border-radius: 0 0 8px 8px;
        }
        &:only-child {
            border-radius: 8px;
        }
        &:hover {
            color: var(--menu-font-highlight-color, #{$light-purple});
            --icon-stroke: var(--menu-icon-stroke-highlight, #{$light-purple});
            background: var(--menu-bg-color-highlight, #{$dark-purple});
        }        
    }
}
.menu-content {
    display: none;
    cursor: pointer;
    --icon-stroke: var(--menu-icon-stroke, #{$dark-purple});
    background-color: var(--menu-bg-color, #{$light-purple});
    border: 1px solid var(--menu-font-color, #{$dark-purple});
    color: var(--menu-font-color, #{$dark-purple});
    border-radius: 9px;
    position: absolute;
    top: 100%;
    z-index: 20;
    white-space: nowrap;
}
</style>