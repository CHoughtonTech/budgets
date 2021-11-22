<template>
    <div class='dashboard-view'>
        <h1 style="color:lightgrey;">Your Budget</h1>
        <div class='summary-group'>
            <div class='summary-group-header'>
                <div class="select is-rounded is-medium">
                    <select v-model="selectedSummary">
                        <option value="1">Monthly</option>
                        <option value="3">Quarterly</option>
                        <option value="6">Semi-Annual</option>
                        <option value="12">Annual</option>
                    </select>
                </div>
            </div>
            <div class='base-summaries'>
                <BaseSummary :summaryName='"Income"' :amount='incomeTotal'></BaseSummary>
                <BaseSummary :summaryName='"Bills"' :amount='expensesTotal'></BaseSummary>
                <BaseSummary :summaryName='"Remaining"' :amount='remainingTotal'></BaseSummary>
            </div>
        </div>
        <br/>
    </div>
</template>

<script>
import BaseSummary from '../components/BaseSummary';
export default {
    components: {
        BaseSummary: BaseSummary
    },
    created() {
        this.summaryList = {
            name: "Budget",
            items: [{
                name: 'Expenses',
                amount: this.expensesTotal
            },
            {
                name: 'Income',
                amount: this.incomeTotal
            },
            {
                name: 'Disposable',
                amount: this.remainingTotal
            }]
        };
    },
    computed: {
        expensesTotal() {
            const bills = this.$store.getters.activeBills;
            let total = 0;
            const summaryMult = parseInt(this.selectedSummary);
            bills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            const result = total * summaryMult;
            return result;
        },
        incomeTotal() {
            const summaryMult = parseInt(this.selectedSummary);
            return 0 * summaryMult;
        },
        remainingTotal() {
            return this.incomeTotal - this.expensesTotal;
        },
        selectedSummaryLabel() {
            switch (parseInt(this.selectedSummary)) {
                case 1:
                    return "Monthly";         
                case 3:
                    return "Quarterly";
                case 6:
                    return "Semi-Annual";
                case 12: 
                    return "Annual";   
                default:
                    return "Monthly";
            }
        }
    },
    data() {
        return {
            summaryList: Object,
            selectedSummary: 1
        }
    }
}
</script>
<style scoped>
.dashboard-view {
    width: 50%;
    min-width: 500px;
}
.base-summaries {
    display: inline-flex;
    flex-wrap: wrap;
}
.summary-group {
    margin-top: 25px;
    text-align:center;
    border-radius: 10px;
    color:whitesmoke;
    font-size:xx-large;
    background-color:#8834B3;
}
.summary-group-header {
    background-color:#411159;
    border-radius: 10px 10px 0 0;
    font-weight: bolder;
}
select {
    background-color: #411159;
    color:whitesmoke;
    border:#411159;
    font-weight:bold;
    text-align: center;
}
</style>