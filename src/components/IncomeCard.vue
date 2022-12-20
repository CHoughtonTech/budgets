<script>
import BaseModal from './BaseModal';
import BaseIcon from './BaseIcon.vue';
import BaseDropdown from './BaseDropdown.vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { defineComponent } from 'vue';
import { mobileCheckMixin, toCurrencyMixin } from '../mixins/GlobalMixin.js';

export default defineComponent({
    components: {
        BaseIcon,
        BaseModal,
        BaseDropdown,
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
            ficaTaxAmount: 0,
            menuItems: [
                {
                    icon: 'info',
                    name: 'Details'
                },
                {
                    icon: 'edit',
                    name: 'Edit'
                },
                {
                    icon: 'delete',
                    name: 'Delete'
                }
            ]
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
        editIncome(income) {
            this.$router.push({ name: 'edit-income', params: { incomeId: income.id } });
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
        },
        menuItemSelected(item) {
            switch (item.toLowerCase()) {
                case 'edit':
                    this.editIncome(this.income);
                    break;
                case 'delete': 
                    this.confirmDelete(this.income);
                    break;
                default:
                    this.showIncomeDetails(this.income);
                    break;
            }
        }
    }
})
</script>
<template>
    <div
        :class="$style['main-content']"
    >
        <div
            :class="[
                $style['income-header'],
                !income.isActive && $style['inactive']
            ]"
        >
            <BaseDropdown
                :menu-items="menuItems"
                @menu-item-selected="menuItemSelected"
            />
            <h3>{{ income.name }}</h3>
        </div>
        <div
            :class="[
                $style['income-body'],
                !income.isActive && $style['inactive']
            ]"
        >
            <p>{{ toCurrency(income.salary) }}</p>
        </div>
        <div
            v-if="showSelectedIncomeDetails"
        >
            <div :class="$style['close-details-button']">
                <BaseIcon
                    name="x"
                    @click="this.showIncomeDetails(this.income)"
                />
            </div>
            <div :class="[
                    $style['income-detail'],
                    !income.isActive && $style['inactive']
                ]">
                <div :class="[
                    $style['income-detail-header'],
                    !income.isActive && $style['inactive']
                ]">
                    <p>Net Salary</p>
                </div>
                <ul :class="$style['income-detail-body']">
                    <li>
                        <p>Annual</p>
                        <p>{{ toCurrency(income.netSalary) }}</p>
                    </li>
                    <li>
                        <p>YTD Earned</p>
                        <p>{{ toCurrency(netAmountYTD) }}</p>
                    </li>
                    <li>
                        <p>Remaining</p>
                        <p>{{ toCurrency(netAmountLeft) }}</p>
                    </li>
                    <li>
                        <p>Paycheck</p>
                        <p>{{ toCurrency(netAmountPerCheck) }}</p>
                    </li>
                </ul>
            </div>
            <div :class="[
                    $style['income-detail'],
                    !income.isActive && $style['inactive']
                ]">
                <div :class="[
                    $style['income-detail-header'],
                    !income.isActive && $style['inactive']
                ]">
                    <p>Pay Info</p>
                </div>
                <ul :class="$style['income-detail-body']">
                    <li>
                        <p>Type</p>
                        <p>{{employmentType}}</p>
                    </li>
                    <li>
                        <p>Frequency</p>
                        <p>{{payPeriodFrequency}}</p>
                    </li>
                    <li v-if="hasFilingStatus">
                        <p>Status</p>
                        <p>{{filingStatus}}</p>
                    </li>
                    <li v-if="hasFilingState">
                        <p>State</p>
                        <p>{{filingStateName}}</p>
                    </li>
                    <li v-if="isHourly">
                        <p>Hourly Rate</p>
                        <p>{{ toCurrency(income.hourlyRate) }}</p>
                    </li>
                    <li v-if="isHourly">
                        <p>Hours Per Week</p>
                        <p>{{ income.hoursPerWeek }}</p>
                    </li>
                    <li v-if="!isHourly">
                        <p>Annual Salary</p>
                        <p>{{ toCurrency(income.salary) }}</p>
                    </li>
                </ul>
            </div>
            <div :class="[
                    $style['income-detail'],
                    !income.isActive && $style['inactive']
                ]">
                <div :class="[
                    $style['income-detail-header'],
                    !income.isActive && $style['inactive']
                ]">
                    <p>Taxes</p>
                </div>
                <ul
                    v-if="!income.isTaxExempt"
                    :class="$style['income-detail-body']"
                >
                    <h4>Federal</h4>
                    <li>
                        <p>Annual Amt</p>
                        <p>{{ toCurrency(federalTaxAmount) }}</p>
                    </li>
                    <li>
                        <p>Amt per check</p>
                        <p>{{ toCurrency(federalTaxAmount / income.payPeriod) }}</p>
                    </li>
                    <li>
                        <p>Rate</p>
                        <p>{{federalTaxRate}}%</p>
                    </li>
                    <h4>State</h4>
                    <li>
                        <p>Annual Amt</p>
                        <p>{{ toCurrency(stateTaxAmount) }}</p>
                    </li>
                    <li>
                        <p>Amt per check</p>
                        <p>{{ toCurrency(stateTaxAmount / income.payPeriod) }}</p>
                    </li>
                    <li>
                        <p>Rate</p>
                        <p>{{stateTaxRate}}%</p>
                    </li>
                    <h4>FICA</h4>
                    <li>
                        <p>Annual Amt</p>
                        <p>{{ toCurrency(ficaTaxAmount) }}</p>
                    </li>
                    <li>
                        <p>Amt per check</p>
                        <p>{{ toCurrency(ficaTaxAmount / income.payPeriod) }}</p>
                    </li>
                    <li>
                        <p>Rate</p>
                        <p>{{ficaTaxRate}}%</p>
                    </li>
                </ul>
                <div
                    v-else
                    :class="$style['income-detail-footer']"
                >
                    <p>Tax Exempt Income!</p>
                </div>
            </div>
            <div :class="[
                    $style['income-detail'],
                    !income.isActive && $style['inactive']
                ]">
                <div :class="[
                    $style['income-detail-header'],
                    !income.isActive && $style['inactive']
                ]">
                    <p>Deductions</p>
                </div>
                <ul
                    v-if="hasDeductions"
                    :class="$style['income-detail-body']"
                >
                    <li v-if="preTaxDeductions.length > 0">
                        <h4>Pre-Tax</h4>
                    </li>
                    <li v-for="(preDeduction, index) in preTaxDeductions" :key="`prededuction-${index}`">
                        <p>{{preDeduction.name}}</p>
                        <p>{{ toCurrency(preDeduction.amount) }}</p>
                    </li>
                    <li v-if="postTaxDeductions.length > 0">
                        <h4>Post-Tax</h4>
                    </li>
                    <li v-for="(postDeduction, index) in postTaxDeductions" :key="`postdeduction-${index}`">
                        <p>{{postDeduction.name}}</p>
                        <p>{{ toCurrency(postDeduction.amount) }}</p>
                    </li>
                    <h4>Totals</h4>
                    <li>
                        <p>Amt per check</p>
                        <p>{{ toCurrency(deductionsTotal) }}</p>
                    </li>
                    <li>
                        <p>Annual Amt</p>
                        <p>{{ toCurrency(deductionsTotal * income.payPeriod) }}</p>
                    </li>
                </ul>
                <div
                    v-else
                    :class="$style['income-detail-footer']"
                >
                    <p>No Deductions!</p>
                </div>
            </div>
        </div>
        <BaseModal v-if="showConfirmDelete">
            <template #header>
                <h3>Confirm Delete</h3>
            </template>
            <template #body>
                <h4>Delete Income: {{selectedIncome.name}}?</h4>
            </template>
            <template #footer>
                <button @click="deleteSelectedIncome">Delete</button>
                <button @click="cancelDelete">Cancel</button>
            </template>
        </BaseModal>
    </div>
</template>
<style lang="scss" module>
.main-content {
    display: flex;
    flex-direction: column;
    background: $light-gray;
    color: $white;
    border-radius: $border-radius-light;
    --menu-bg-color: #{$white};
    --menu-bg-color-highlight: #{$light-purple};
    --menu-font-highlight-color: #{$dark-purple};
    --menu-icon-stroke-highlight: #{$dark-purple};
}
.income-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: $dark-purple;
    border-radius: 9px 9px 0 0;
    padding: 10px;
    &.inactive {
        background: $gray;
        color: $dark-gray;
        --icon-stroke: #{$dark-gray};
        --menu-icon-stroke: #{$light-gray};
        --menu-bg-color: #{$dark-gray};
        --menu-bg-color-highlight: #{$light-gray};
        --menu-font-color: #{$light-gray};
        --menu-font-highlight-color: #{$purple};
        --menu-icon-stroke-highlight: #{$purple};
        h3 {
            color: $dark-gray !important;
            font-style: italic;
        }
    }
}
.income-body {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: $light-gray;
    padding: 10px;
    font-size: $font-size-xlarge;
    color: $dark-purple;
    border-radius: 0 0 $border-radius-light $border-radius-light;
    font-weight: $font-weight-bold;
    &.inactive {
        font-style: italic;
        color: $dark-gray;
    }
}
.income-detail {
    display: flex;
    flex-direction: column;
    background: $dark-gray;
    border-radius: 25px;
    margin: 20px;
    > ul {
        list-style: none;
        > li {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }
    &.inactive {
        background: $gray;
        font-weight: $font-weight-bold;
        ul {
            h4 {
                color: $dark-purple;
            }
            li {
                color: $dark-gray;
            }
        }
    }
}
.income-detail-body {
    list-style: none;
    padding: 10px;
}
.income-detail-header {
    display: flex;
    justify-content: center;
    background: $purple;
    border-radius: $border-radius-medium $border-radius-medium 0 0;
    color: $white;
    font-size: $font-size-xxlarge;
    font-weight: $font-weight-bold;
    padding: 10px;
    &.inactive {
        color: $light-purple;
        background: $dark-gray;
    }
}
.income-detail-footer {
    display: flex;
    justify-content: center;
    font-size: $font-size-large;
    font-weight: $font-weight-bolder;
    text-transform: uppercase;
    padding: 10px;
}
.close-details-button {
    --icon-stroke: #{$dark-gray};
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
    > div {
        border: 2px solid $dark-gray;
        border-radius: 100px;
        padding: 5px;
        cursor: pointer;
        &:hover {
            --icon-stroke: #{$light-gray};
            background: $dark-gray;
        }
    }
}
</style>