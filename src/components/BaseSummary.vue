<script>
import BaseIcon from '../components/BaseIcon';
import { defineComponent } from 'vue';
export default defineComponent({
    components: {
        BaseIcon: BaseIcon
    },
    props: {
        summaryName: {
            type: [String],
            default: 'Default Name'
        },
        amount:{
            type: [Number, String],
            default: 0
        },
        summaryLink: {
            type: [String],
            default: null
        },
        summaries: Object
    },
    computed: {
        isNegativeAmount() {
            return this.amount <= 0;
        },
    },
})
</script>
<template>
    <div :class="$style['base-summary']">
        <div v-if='summaries === undefined'>
            <div
                v-if='summaryLink === null'
                :class="$style['base-summary-header']"
            >
                {{summaryName}}
            </div>
            <div
                v-else
                :class="$style['base-summary-header']"
            >
                {{summaryName}}
                <router-link :to="{ name: summaryLink }">
                    <BaseIcon :name='"arrow-right-circle"' />
                </router-link>
            </div>
            <div
                :class="[$style['base-summary-body'], isNegativeAmount && $style['is-negative']]"
            >
                {{ amount }}
            </div>
        </div>
        <div v-else>
            <div :class="$style['base-summary-header']">{{summaries.name}}</div>
            <ul
                v-for="summary in summaries.items"
                :class="$style['base-summary-body-list']"
                :key="summary.name"
            >
                <li :class="$style['base-summary-body-list-label']">
                    {{summary.name}}
                </li>
                <li :class="[
                        $style['base-summary-body-list-amount'],
                        summary.amount <= 0 && $style['is-negative']
                    ]"
                >
                    {{ summary.amount }}
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="scss" module>
.base-summary {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: 10px;
    border: 2px solid $light-purple;
    border: 0;
    color: $light-gray;
    background-color: $primary-bg-color;
}
.base-summary-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $dark-purple;
    border-radius: 10px 10px 0 0;
    font-size: $font-size-large;
    font-weight: $font-weight-bold;
    color: $white;
}
.base-summary-body {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: $font-size-large;
    &.is-negative {
        color: $red;
    }
}
.base-summary-body-list-label {
    display: flex;
    color: $white;
    font-weight: $font-weight-bold;
    padding-left: 5px;
}
.base-summary-body-list-amount {
    color: $purple;
    font-weight: $font-weight-bold;
    font-style: italic;
    &.is-negative {
        color: $red;
    }
}
</style>