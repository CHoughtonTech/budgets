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
                <BaseSummary :summaryName='"Net Income"' :amount='incomeTotal' :summaryLink='"income"'></BaseSummary>
                <BaseSummary :summaryName='"Bills"' :amount='expensesTotal' :summaryLink='"bills"'></BaseSummary>
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
    computed: {
        expensesTotal() {
            const bills = this.$store.getters.activeBills.filter(b => b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === ''));
            let total = 0;
            const summaryMult = parseInt(this.selectedSummary);
            bills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            const result = total * summaryMult;
            return result;
        },
        incomeTotal() {
            const income = this.$store.getters.getIncomes.filter(i => i.isActive === true);
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