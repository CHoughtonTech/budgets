<script>
import BaseIcon from './BaseIcon';
import BaseModal from './BaseModal';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { defineComponent } from 'vue';
import { mobileCheckMixin, toCurrencyMixin } from '../mixins/GlobalMixin.js';

export default defineComponent({
    components: {
        BaseIcon,
        BaseModal,
    },
    mixins: [
        mobileCheckMixin,
        toCurrencyMixin
    ],
    props: {
        income: Object
    },
    created() {
        this.setTaxRates();
    },
    computed: {
        ...mapState(mainStore, ['federalTaxBrackets', 'stateTaxBrackets', 'ficaRate', 'states']),
        isHourly() {
            return this.income.type === 'h';
        },
        hasDeductions() {
            return this.income.deductions.length > 0;
        },
        netAmountPerCheck() {
            return this.toFixedNumber(this.income.netSalary / this.income.payPeriod, 2);
        },
        netAmountYTD() {
            let totalPayPeriods = this.getPayPeriodsPassed();
            return this.toFixedNumber(totalPayPeriods * (this.income.netSalary / this.income.payPeriod), 2);
        },
        netAmountLeft() {
            return this.income.netSalary - this.netAmountYTD;
        },
        preTaxDeductions() {
            let preTaxDeductionArr = this.income.deductions?.filter(d => d.type === 'pretax');
            return preTaxDeductionArr;
        },
        postTaxDeductions() {
            return this.income.deductions?.filter(d => d.type === 'posttax');
        },
        preTaxDeductedIncome() {
            let result = 0;
            this.preTaxDeductions.forEach(p => {
                result += p.amount;
            })
            result = this.income.salary - (result * this.income.payPeriod);
            return result;
        },
        deductionsTotal() {
            let result = 0;
            this.income.deductions.forEach(d => {
                result += d.amount;
            });
            return result;
        },
        filingStateName() {
            const foundState = this.states.find(s => s.abbreviation === this.income.state);
            if (foundState && foundState !== null) {
                return foundState.name;
            } else {
                return null;
            }
        },
        hasFilingState() {
            let foundState = this.states.find(s => s.abbreviation === this.income.state);
            return foundState && foundState !== null;
        },
        employmentType() {
            let result = null;
            switch (this.income.employmentType) {
                case 'pt':
                    result = 'Part Time';
                    break;
                case 'c': 
                    result = 'Contractor';
                    break;
                default:
                    result = 'Full Time';
                    break;
            }
            return result;
        },
        payPeriodFrequency() {
            let result = null;
            switch (this.income.payPeriod) {
                case 12:
                    result = 'Monthly';
                    break;
                case 24: 
                    result = 'Bi-Monthly';
                    break;
                case 26: 
                    result = 'Bi-Weekly';
                    break;
                default:
                    result = 'Weekly';
                    break;
            }
            return result;
        },
        hasFilingStatus() {
            return this.income.filingStatus !== null;
        },
        filingStatus() {
            let result = null;
            switch (this.income.filingStatus) {
                case 'h':
                    result = 'Head of Household';
                    break;
                case 'm': 
                    result = 'Married';
                    break;
                default:
                    result = 'Single';
                    break;
            }
            return result;
        }
    },
    data() {
        return {
            selectedIncome: {},
            showConfirmDelete: false,
            showSelectedIncomeDetails: false,
            federalTaxRate: 0,
            stateTaxRate: 0,
            ficaTaxRate: 0,
            federalTaxAmount: 0,
            stateTaxAmount: 0,
            ficaTaxAmount: 0
        };
    },
    methods: {
        ...mapActions(mainStore, ['deleteIncome']),
        confirmDelete(income) {
            this.selectedIncome = income;
            this.toggleShowConfirmDelete();
        },
        showIncomeDetails(income) {
            this.selectedIncome = income;
            this.toggleShowIncomeDetails();
        },
        toggleShowConfirmDelete() {
            this.showConfirmDelete = !this.showConfirmDelete;
        },
        toggleShowIncomeDetails() {
            this.showSelectedIncomeDetails = !this.showSelectedIncomeDetails;
        },
        deleteSelectedIncome() {
            if (this.selectedIncome && this.selectedIncome !== null) {
                this.deleteIncome(this.selectedIncome.id).then(() => {
                    this.toggleShowConfirmDelete();
                    this.selectedIncome = {};
                });
            }
        },
        cancelDelete() {
            this.selectedIncome = {};
            this.toggleShowConfirmDelete();
        },
        toFixedNumber(num, digits, base){
            var pow = Math.pow(base||10, digits);
            return Math.round(num*pow) / pow;
        },
        getWeekNum() {
            const currentDate = new Date();
            const msInDay = 24 * 60 * 60 * 1000;
            let oneJan = new Date(currentDate.getFullYear(), 0, 1);
            let result = Math.floor((((currentDate.getTime() - oneJan.getTime()) / msInDay) + oneJan.getDay() + 1) / 7) - 1;
            return result;
        },
        getDaysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        },
        getPayPeriodsPassed() {
            let result = 0;
            const numMonths = new Date().getMonth() + 1;
            const thisYear = new Date().getFullYear();
            const today = new Date().getDate();
            for (let i = 0; i < this.getWeekNum(); i++) {
                switch (this.income.payPeriod) {
                    case 26:
                    case 52:
                        if (i % (52 / this.income.payPeriod) === 0) {
                            result++;
                        }
                        break;
                    case 24:
                        result = 0;
                        result = (numMonths * 2);
                        if (today < Math.ceil(this.getDaysInMonth(numMonths, thisYear) / 2)) {
                            result--;
                        }
                        break;
                    case 12:
                        result = numMonths;
                        break;                
                    default:
                        break;
                }
            }
            return result;
        },
        getStateFilingStatus() {
            switch (this.income.filingStatus) {
                case 'm':
                    return 'm';
                case 'h': 
                case 's':
                    return 's';
                default:
                    return null;
            }
        },
        setTaxRates() {
            if (this.income.isTaxExempt)
                return;
            this.federalTaxRate = this.federalTaxBrackets.filter(ft => ft.filing_status === this.income.filingStatus && ft.incomeMin < this.income.salary && ft.incomeMax > this.income.salary)[0].rate;
            this.stateTaxRate = this.stateTaxBrackets.filter(s => s.filing_status === this.getStateFilingStatus() && s.incomeMin < this.income.salary && s.state === this.income.state).sort((a,b) => {
                    let x = typeof a.rate === 'number' ? a.rate : parseFloat(a.rate);
                    let y = typeof b.rate === 'number' ? b.rate : parseFloat(b.rate);
                    if (x < y) { return 1 }
                    if (x > y) { return -1 }
                    return 0;
                })[0].rate;
            this.ficaRate.forEach(fica => {
                this.ficaTaxRate += fica.rate;
            });
            this.setTaxAmounts();
        },
        setTaxAmounts() {
            const fedTaxRatePct = this.federalTaxRate / 100;
            const stateTaxRatePct = this.stateTaxRate / 100;
            const ficaTaxRatePct = this.ficaTaxRate / 100;
            this.stateTaxAmount = this.toFixedNumber(this.preTaxDeductedIncome * stateTaxRatePct, 2);
            this.federalTaxAmount = this.toFixedNumber(this.preTaxDeductedIncome * fedTaxRatePct, 2);
            this.ficaTaxAmount = this.toFixedNumber(this.preTaxDeductedIncome * ficaTaxRatePct, 2);
        }
    }
})
</script>
<template>
    <div style="margin: 0px 0px 40px 0px">
        <div class="level is-mobile" :class="{'income-is-active' : income.isActive, 'income-is-inactive' : !income.isActive}">
            <div class="level-item has-text-centered">
                <div>
                    <br/>
                    <p class="heading">Name</p>
                    <p class="title is-4">{{income.name}}</p>
                    <br/>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <div>
                    <p class="heading">Annual Gross Salary</p>
                    <p class="title is-4">{{ toCurrency(income.salary) }}</p>
                </div>
            </div>
            <div v-if="!isMobileDevice()" class="level-item has-text-centered">
                <div>
                    <p class="heading">Annual Net Salary</p>
                    <p class="title is-4">{{ toCurrency(income.netSalary) }}</p>
                </div>
            </div>
            <div v-if="!isMobileDevice()" class="level-item has-text-centered">
                <div>
                    <p class="heading">IsActive</p>
                    <p v-if="income.isActive">
                        <BaseIcon name="check-circle"></BaseIcon>
                    </p>
                    <p v-else>
                        <BaseIcon name="x-circle"></BaseIcon>
                    </p>
                </div>
            </div>
            <div class="level-item">
                <p class="is-pulled-left button is-info" @click="showIncomeDetails(income)">
                    <BaseIcon name="info"></BaseIcon>
                </p>
                <div>&nbsp;</div>
                <router-link class="is-pulled-left button is-success" :to="{ name: 'edit-income', params: { incomeId: income.id }}">
                    <p>
                        <BaseIcon name="edit" width="12" height="12"></BaseIcon>
                    </p>
                </router-link>
                <div>&nbsp;</div>
                <p class="is-pulled-right button is-danger" @click="confirmDelete(income)">
                    <BaseIcon name="delete"></BaseIcon>
                </p>
            </div>
        </div>
        <div v-if="showSelectedIncomeDetails" class="tile is-ancestor income-detail">
            <div class="tile is-vertical">
                <div class="tile">
                    <div class="tile is-parent is-vertical">
                        <article class="tile is-child income-detail-box">
                            <div class="is-flex is-justify-content-center">
                                <h4 class="income-detail-box-header">Net Salary</h4>
                            </div>
                            <hr/>
                            <ul>
                                <li>
                                    <span>Annual</span>
                                    <span class="is-pulled-right">{{ toCurrency(income.netSalary) }}</span>
                                </li>
                                <li>
                                    <span>YTD Earned</span>
                                    <span class="is-pulled-right">{{ toCurrency(netAmountYTD) }}</span>
                                </li>
                                <li>
                                    <span>Remaining</span>
                                    <span class="is-pulled-right">{{ toCurrency(netAmountLeft) }}</span>
                                </li>
                                <li>
                                    <span>Paycheck</span>
                                    <span class="is-pulled-right">{{ toCurrency(netAmountPerCheck) }}</span>
                                </li>
                            </ul>
                        </article>
                    </div>
                    <div class="tile is-parent">
                        <article class="tile is-child income-detail-box">
                            <div class="is-flex is-justify-content-center">
                                <h4 class="income-detail-box-header">Pay Info</h4>
                            </div>
                            <hr/>
                            <ul>
                                <li>
                                    <span>Employment Type</span>
                                    <span class="is-pulled-right">{{employmentType}}</span>
                                </li>
                                <li>
                                    <span>Pay Period Frequency</span>
                                    <span class="is-pulled-right">{{payPeriodFrequency}}</span>
                                </li>
                                <li v-if="hasFilingStatus">
                                    <span>Filing Status</span>
                                    <span class="is-pulled-right">{{filingStatus}}</span>
                                </li>
                                <li v-if="hasFilingState">
                                    <span>Filing State</span>
                                    <span class="is-pulled-right">{{filingStateName}}</span>
                                </li>
                                <li v-if="isHourly">
                                    <span>Hourly Rate</span>
                                    <span class="is-pulled-right">{{ toCurrency(income.hourlyRate) }}</span>
                                </li>
                                <li v-if="isHourly">
                                    <span>Hours Per Week</span>
                                    <span class="is-pulled-right">{{ toCurrency(income.hoursPerWeek) }}</span>
                                </li>
                                <li v-if="!isHourly">
                                    <span>Annual Salary</span>
                                    <span class="is-pulled-right">{{ toCurrency(income.salary) }}</span>
                                </li>
                            </ul>
                        </article>
                    </div>
                </div>
                <div class="tile">
                    <div class="tile is-parent">
                        <article class="tile is-child income-detail-box">
                            <div class="is-flex is-justify-content-center">
                                <h4 class="income-detail-box-header">Taxes</h4>
                            </div>
                            <hr/>
                            <ul v-if="!income.isTaxExempt">
                                <li>
                                    <span>Annual Federal Taxes</span>
                                    <span class="is-pulled-right">{{ toCurrency(federalTaxAmount) }}</span>
                                </li>
                                <li>
                                    <span>Federal Taxes per paycheck</span>
                                    <span class="is-pulled-right">{{ toCurrency(federalTaxAmount / income.payPeriod) }}</span>
                                </li>
                                <li>
                                    <span>Federal Tax Rate</span>
                                    <span class="is-pulled-right">{{federalTaxRate}}%</span>
                                </li>
                                <li>
                                    <span>Annual State Taxes</span>
                                    <span class="is-pulled-right">{{ toCurrency(stateTaxAmount) }}</span>
                                </li>
                                <li>
                                    <span>State Taxes per paycheck</span>
                                    <span class="is-pulled-right">{{ toCurrency(stateTaxAmount / income.payPeriod) }}</span>
                                </li>
                                <li>
                                    <span>State Tax Rate</span>
                                    <span class="is-pulled-right">{{stateTaxRate}}%</span>
                                </li>
                                <li>
                                    <span>Annual FICA Taxes</span>
                                    <span class="is-pulled-right">{{ toCurrency(ficaTaxAmount) }}</span>
                                </li>
                                <li>
                                    <span>FICA Taxes per paycheck</span>
                                    <span class="is-pulled-right">{{ toCurrency(ficaTaxAmount / income.payPeriod) }}</span>
                                </li>
                                <li>
                                    <span>FICA Tax Rate</span>
                                    <span class="is-pulled-right">{{ficaTaxRate}}%</span>
                                </li>
                            </ul>
                            <div v-else class="is-flex is-justify-content-center notification is-info">
                                <p>Tax Exempt Income!</p>
                            </div>
                        </article>
                    </div>
                    <div class="tile is-parent">
                        <article class="tile is-child income-detail-box">
                            <div class="is-flex is-justify-content-center">
                                <h4 class="income-detail-box-header">Deductions</h4>
                            </div>
                            <hr/>
                            <ul v-if="hasDeductions">
                                <li v-if="preTaxDeductions.length > 0" class="is-flex is-justify-content-center">
                                    <span>Pre-Tax Deductions</span>
                                </li>
                                <li v-for="(preDeduction, index) in preTaxDeductions" :key="`prededuction-${index}`">
                                    <span>{{preDeduction.name}}</span>
                                    <span class="is-pulled-right">{{ toCurrency(preDeduction.amount) }}</span>
                                </li>
                                <li v-if="postTaxDeductions.length > 0" class="is-flex is-justify-content-center">
                                    <span>Post-Tax Deductions</span>
                                </li>
                                <li v-for="(postDeduction, index) in postTaxDeductions" :key="`postdeduction-${index}`">
                                    <span>{{postDeduction.name}}</span>
                                    <span class="is-pulled-right">{{ toCurrency(postDeduction.amount) }}</span>
                                </li>
                                <hr>
                                <li>
                                    <span>Total per paycheck</span>
                                    <span class="is-pulled-right">{{ toCurrency(deductionsTotal) }}</span>
                                </li>
                                <li>
                                    <span>Annual Deduction Amount</span>
                                    <span class="is-pulled-right">{{ toCurrency(deductionsTotal * income.payPeriod) }}</span>
                                </li>
                            </ul>
                            <div v-else class="is-flex is-justify-content-center notification is-info">
                                <p>No Deductions!</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
        <BaseModal v-if="showConfirmDelete">
            <template #header>
                <h3>Confirm Delete</h3>
            </template>
            <template #body>
                <div>
                    <h4>Delete Income Source: {{selectedIncome.name}}?</h4>
                </div>
            </template>
            <template #footer>
                <div>
                    <button class="is-pulled-right" @click="cancelDelete">Cancel</button>
                    <button class="is-pulled-right" @click="deleteSelectedIncome">Delete</button>
                    <br/><br/>
                </div>
            </template>
        </BaseModal>
    </div>
</template>
<style scoped>
div {
    color:whitesmoke;
}
p {
    color:whitesmoke;
}
.income-is-active {
    background-color: #411159;
    color: whitesmoke;
    border-radius: 25px;
}
.income-is-inactive {
    background-color: #636263;
    color:slategrey;
    font-style:italic;
    border-radius: 25px;
}
.income-detail {
    background-color: #8834B3;
    border-radius: 25px;
    margin-right: 20px;
    margin-left: 20px;
}
.income-detail-box {
    background-color: #2D3033;
    color: whitesmoke;
    padding: 20px;
    border-radius: 25px;
}
.income-detail-box-header {
    color: whitesmoke;
    font-weight: bolder;
    font-size:xx-large;    
}
</style>