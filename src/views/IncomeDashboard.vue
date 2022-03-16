<template>
    <div>
        <h1>Income Sources</h1>
        <hr/><br/>
        <div v-if="incomeCount > 0" class="level is-mobile">
            <div v-if="isMobileDevice()" class="level-left">
                <div v-if="activeIncomesCount > 0" class="level-item">
                    <p class="subtitle is-5">
                        Active Incomes: <span class="badge -fill-gradient">{{activeIncomesCount}}</span>
                    </p>
                </div>
                <div v-if="inactiveIncomesCount > 0 && activeIncomesCount < 1">
                    <p class="subtitle is-5">
                        InActive Incomes: <span class="badge -fill-gradient">{{inactiveIncomesCount}}</span>
                    </p>
                </div>
            </div>
            <div else class="level-left">
                &nbsp;
            </div>
            <div class="level-right">
                <div class="level-item">
                    <router-link class="add-income subtitle is-5" :to="{ name: 'create-income', params: { incomeId: -1 }}"><BaseIcon name="plus-circle">Add an Income</BaseIcon></router-link>
                </div>
            </div>
        </div>
        <div v-if="activeIncomesCount > 0">
            <IncomeCard v-for="income in activeIncomes" :key="income.id" :income="income"></IncomeCard>
        </div>
        <div v-if="inactiveIncomesCount > 0 && activeIncomesCount > 0" class="level is-mobile">
            <div v-if="isMobileDevice()" class="level-left">
                <p class="subtitle is-5">
                    InActive Incomes: <span class="badge -fill-gradient">{{inactiveIncomesCount}}</span>
                </p>
            </div>
        </div>
        <div v-if="inactiveIncomesCount > 0">
            <IncomeCard v-for="income in inactiveIncomes" :key="income.id" :income="income"></IncomeCard>
        </div>
        <div class="no-incomes" v-if="incomeCount < 1">
            <p>Oh snap! You have no income sources! Click below to create your first income source!</p>
            <br/>
            <router-link class="add-income subtitle is-5" :to="{ name: 'create-income' }"><button><BaseIcon name="plus-circle">Add an Income</BaseIcon></button></router-link>
        </div>
    </div>
</template>
<script>
import BaseIcon from '../components/BaseIcon';
import IncomeCard from '../components/IncomeCard';
import { mobileCheckMixin } from '../mixins/GlobalMixin.js';

export default {
    components: {
        BaseIcon: BaseIcon,
        IncomeCard: IncomeCard
    },
    mixins: [mobileCheckMixin],
    created() {
        this.incomes = this.$store.getters.getIncomes;
    },
    computed: {
        activeIncomesCount() {
            let activeIncomesCount = 0;
            if (this.incomes && this.incomes.length > 0) {
                activeIncomesCount = this.incomes.filter(i => i.isActive === true).length;
            }
            return activeIncomesCount;
        },
        inactiveIncomesCount() {
            let inactiveIncomesCount = 0;
            if (this.incomes && this.incomes.length > 0) {
                inactiveIncomesCount = this.incomes.filter(i => i.isActive === false).length;
            }
            return inactiveIncomesCount;
        },
        activeIncomes() {
            return this.incomes.filter(i => i.isActive === true);
        },
        inactiveIncomes() {
            return this.incomes.filter(i => i.isActive === false);
        },
        incomeCount() {
            let incomesCount = 0;
            if (this.incomes && this.incomes.length > 0) {
                incomesCount = this.incomes.length;
            }
            return incomesCount;
        }
    },
    data() {
        return {
            incomes: [],
            income: {
                id: null,
                name: null,
                type: null,
                salary: 0,
                hourlyRate: 0,
                hoursPerWeek: 0,
                employmentType: null,
                filingStatus: null,
                payPeriod: null,
                state: null,
                isActive: true,
                isTaxExempt: false,
                deductions: []
            },
            showSelectedIncomeDetails: false
        }
    },
    methods: {
        deleteIncome(income) {
            this.$store.dispatch('deleteIncome', income.id).then(() => {
                this.$router.push('/');
            });
        }
    }
}
</script>
<style scoped>
span {
    color:whitesmoke;
}
ul {
    color:whitesmoke;
    font-size: large;
}
.deduction-item {
    background-color: #8834B3;
    color: whitesmoke;
    font-size: large;
    border: solid 1px whitesmoke;
}
.deduction-amount {
    text-align:center;
}
.deduction-header {
    background-color: #411159;
    font-size: x-large;
    text-align: center;
    border-color: whitesmoke;
    border: solid 1px;
}
.toggle-deductions {
    cursor: pointer;
}
.remove-deduction-item {
    cursor: pointer;
}
.is-deduction-panel {
    background-color: #8834B3;
}
.add-income {
    cursor: pointer;
    text-decoration: none;
}
.income-is-active {
    background-color: #411159;
    color: whitesmoke;
    border-radius: 25px;
}
p {
    color:whitesmoke;
}
.no-incomes {
    color:whitesmoke;
    text-align:center;
}
</style>