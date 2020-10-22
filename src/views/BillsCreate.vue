<template>
    <div>
        <h1>Add Bill</h1>
        <label for="billName">Name</label>
        <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
        <input id="billName" type="text" v-model="bill.name" placeholder="Bill Name" :class="{'error-detail-input': validationFailed('billName')}" />
        <label for="billAmount">Amount</label>
        <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
        <input id="billAmount" type="text" v-model="bill.amount" placeholder="0.00" :class="{'error-detail-input': validationFailed('billAmount')}" />
        <label for="billFixedAmount">Is fixed amount?</label>
        <input id="billFixedAmount" type="checkbox" v-model="bill.isFixedAmount" />
        <label for="billRecurring">Is recurring?</label>
        <input id="billRecurring" type="checkbox" v-model="bill.isRecurring" />
    </div>
</template>
<script>
export default {
    date() {
        return {
            bill: Object
        }
    }
};
</script>