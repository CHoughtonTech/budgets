<template>
    <div class='base-summary'>
        <div v-if='summaries === undefined'>
            <div v-if='summaryLink === null' class='base-summary-header'>{{summaryName}} &nbsp;<BaseIcon :name='"arrow-right-circle"'></BaseIcon></div>
            <div v-else class='base-summary-header'>{{summaryName}} &nbsp;<router-link :to="{ name: summaryLink }"><BaseIcon :name='"arrow-right-circle"'></BaseIcon></router-link></div>
            <div :class='{"base-summary-body": amount > 0, "base-summary-body-neg": amount <= 0}'>{{amount | currency}}</div>
        </div>
        <div v-else>
            <div class='base-summary-header'>{{summaries.name}}</div>
            <ul v-for="summary in summaries.items" :key="summary.name">
                <li class='base-summary-body-list'>
                    <span class='base-summary-body-list-label'>{{summary.name}}:</span>&nbsp; 
                    <span :class='{"base-summary-body-list-amount": summary.amount > 0, "base-summary-body-list-amount-neg": summary.amount <= 0}'>{{summary.amount | currency}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import BaseIcon from '../components/BaseIcon'
export default {
    components: {
        BaseIcon: BaseIcon
    },
    props: {
        summaryName: {
            type: [String],
            default: "Default Name"
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
    }
}
</script>
<style scoped>
.base-summary {
    width: 25%;
    flex: content;
    margin:5px;
    min-width: 200px;
    border-radius: 10px;
    border: 1px solid #A755C2;
    color: lightgrey;
    background-color:#2D3033;
}
.base-summary-header {
    background-color: #411159;
    border-radius: 10px 10px 0 0;
    text-align: center;
    font-size: x-large;
    font-weight: bolder;
    color: whitesmoke;
}
.base-summary-body {
    text-align:center;
    font-size: xx-large;
}
.base-summary-body-neg {
    text-align: center;
    font-size: xx-large;
    color:crimson;
}
.base-summary-body-list-label {
    color: whitesmoke;
    font-weight: bold;
    padding-left: 5px;
}
.base-summary-body-list-amount {
    color: #9C50B6;
    font-weight: bold;
    font-size: medium;
    font-style: italic;
}
.base-summary-body-list-amount-neg {
    color: crimson;
    font-weight: bold;
    font-size: medium;
    font-style: italic;
}
</style>