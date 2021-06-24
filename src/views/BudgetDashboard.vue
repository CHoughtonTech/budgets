<template>
    <div class='dashboard-view'>
        <h1 style="color:lightgrey;">Curt's Budget</h1>
        <!-- <h3 style="color:white;font-weight:bold"><i>This is currently under construction.</i></h3>
        <img src="https://media1.tenor.com/images/bc78ea2aa84a3776d6b54d6a04e9da86/tenor.gif?itemid=17626280" style="width:750px"/> -->
        <!-- <BaseSummary :summaries='summaryList'></BaseSummary> -->
        <div class='summary-group'>
            <div class='summary-group-header'>Monthly</div>
            <div class='base-summaries'>
                <!-- <BaseSummary :summaries='summaryList'></BaseSummary> -->
                <BaseSummary :summaryName='"Income"' :amount='incomeTotal'></BaseSummary>
                <BaseSummary :summaryName='"Bills"' :amount='expensesTotal'></BaseSummary>
                <BaseSummary :summaryName='"Remaining"' :amount='remainingTotal'></BaseSummary>
            </div>
        </div>
        <div class='summary-group'>
            <div class='summary-group-header'>Annual</div>
            <div class='base-summaries'>
                <!-- <BaseSummary :summaries='summaryList'></BaseSummary> -->
                <BaseSummary :summaryName='"Income"' :amount='incomeTotal*12'></BaseSummary>
                <BaseSummary :summaryName='"Bills"' :amount='expensesTotal*12'></BaseSummary>
                <BaseSummary :summaryName='"Remaining"' :amount='remainingTotal*12'></BaseSummary>
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
            let bills = this.$store.getters.activeBills;
            let total = 0;
            bills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total;
        },
        incomeTotal() {
            return 0;
        },
        remainingTotal() {
            return this.incomeTotal - this.expensesTotal;
        }
    },
    data() {
        return {
            summaryList: Object
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
</style>