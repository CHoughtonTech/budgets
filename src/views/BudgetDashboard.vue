<script>
import { defineComponent } from 'vue';
import BaseSummary from '../components/BaseSummary';
import { toCurrencyMixin } from '../mixins/GlobalMixin';
import { mapState, mapActions } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BaseSummary: BaseSummary
    },
    mixins: [toCurrencyMixin],
    mounted() {
        if (!this.isStoreInitialized)
            this.initStore();
    },
    methods: {
        ...mapActions(mainStore, ['initStore'])
    },
    computed: {
        ...mapState(mainStore, ['activeBills', 'user', 'income', 'isStoreInitialized']),
        expensesTotal() {
            const bills = this.activeBills.filter(b => b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === ''));
            let total = 0;
            const summaryMult = parseInt(this.selectedSummary);
            bills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total * summaryMult;
        },
        userName() {
            return this.user?.displayName ? `${this.user.displayName}'s` : 'Your';
        },
        incomeTotal() {
            const income = this.income.filter(i => i.isActive === true);
            const summaryMult = parseInt(this.selectedSummary);
            let total = 0;
            income.forEach(i => {
                let perMonth = 0;
                switch (i.payPeriod) {
                    case 52:
                        perMonth = 4;
                        break;
                    case 24:
                    case 26: 
                        perMonth = 2;
                        break;
                    case 12:
                        perMonth = 1;
                        break;
                    default:
                        perMonth = 2;
                        break;
                }
                let payPerMonth = summaryMult === 12 ? i.netSalary / 12 : (i.netSalary / i.payPeriod) * perMonth;
                total += payPerMonth;
            })
            return total * summaryMult;
        },
        remainingTotal() {
            return this.incomeTotal - this.expensesTotal;
        },
        selectedSummaryLabel() {
            switch (parseInt(this.selectedSummary)) {
                case 1:
                    return 'Monthly';         
                case 3:
                    return 'Quarterly';
                case 6:
                    return 'Semi-Annual';
                case 12: 
                    return 'Annual';   
                default:
                    return 'Monthly';
            }
        }
    },
    data() {
        return {
            selectedSummary: 1
        }
    }
})
</script>
<template>
    <div :class="$style['main-content']">
        <!-- <h1>{{ userName }} Budget</h1> -->
        <p :class="$style['dashboard-title']">{{ userName }} Budget</p>
        <div :class="$style['summary-group']">
            <div :class="$style['summary-group-header']">
                <select v-model="selectedSummary">
                    <option value="1">Monthly</option>
                    <option value="3">Quarterly</option>
                    <option value="6">Semi-Annual</option>
                    <option value="12">Annual</option>
                </select>
            </div>
            <div :class="$style['base-summaries']">
                <BaseSummary :summaryName='"Net Income"' :amount='toCurrency(incomeTotal)' :summaryLink='"income"'></BaseSummary>
                <BaseSummary :summaryName='"Bills"' :amount='toCurrency(expensesTotal)' :summaryLink='"bills"'></BaseSummary>
                <BaseSummary :summaryName='"Remaining"' :amount='toCurrency(remainingTotal)'></BaseSummary>
            </div>
        </div>
    </div>
</template>
<style lang="scss" module>
.dashboard-title {
    font: $h1-font-full;
    color: $heading-font-color;
    align-self: center;
    @media (min-width: 320px) and (max-width: 768px){
        font: $h2-font-full;
    }
}
.main-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.base-summaries {
    display: flex;
    @media (min-width: 320px) and (max-width: 768px){
        flex-direction: column;
    }
    padding: 10px 5px;
    border: 0;
    gap: 10px;
}
.summary-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 10px;
    color: $white;
    font-size: $font-size-xlarge;
    background-color: $purple;
}
.summary-group-header {
    display: flex;
    justify-content: center;
    background-color: $dark-purple;
    border-radius: 10px 10px 0 0;
    font-weight: $font-weight-bolder;
}
select {
    background-color: $dark-purple;
    color:$white;
    border:0;
    font-weight: $font-weight-bold;
}
</style>