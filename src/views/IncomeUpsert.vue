<script>
import BaseModal from '../components/BaseModal';
import BaseIcon from '../components/BaseIcon';
import { toCurrencyMixin, guid } from '../mixins/GlobalMixin';
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BaseModal,
        BaseIcon,
    },
    mixins: [toCurrencyMixin, guid],
    props: {
        incomeId: null,
    },
    created() {
        if (this.incomeId) {
            this.loadIncome(this.incomeId);
        }
    },
    computed: {
        ...mapState(mainStore, ['federalTaxBrackets', 'stateTaxBrackets', 'ficaRate', 'states', 'getUserId', 'income']),
        selectedStateTaxes() {
            return this.stateTaxBrackets.filter(s => s.state === this.userIncome.state && s.filing_status === this.selectedStateFilingStatus);
        },
        selectedStateFilingStatus() {
            switch (this.userIncome.filingStatus) {
                case 'm':
                    return 'm';
                case 'h': 
                case 's':
                    return 's';
                default:
                    return null;
            }
        },
        amountPerPaycheck() {
            if (this.netIncome > 0) {
                return this.toFixedNumber(this.netIncome / this.userIncome.payPeriod, 2);
            } else {
                return 0;
            }    
        },
        amountGrossPerCheck() {
            if (this.userIncome.salary > 0) {
                return this.toFixedNumber(this.userIncome.salary / this.userIncome.payPeriod, 2);
            } else {
                return 0;
            }
        },
        postTaxDeductions() {
            return this.userIncome.deductions.filter(d => d.type === 'posttax');
        },
        preTaxDeductions() {
            return this.userIncome.deductions.filter(d => d.type === 'pretax');
        },
        hasPostTaxDeductions() {
            return this.postTaxDeductions.length > 0;
        },
        hasPreTaxDeductions() {
            return this.preTaxDeductions.length > 0;
        },
        preTaxDeductionTotal() {
            let preTaxTotal = 0;
            if (this.userIncome.deductions && this.userIncome.deductions.length > 0) {
                this.userIncome.deductions.forEach(d => {
                    let amount = parseFloat(d.amount);
                    if (d.type === 'pretax'){
                        preTaxTotal += amount;
                    } 
                })
            }
            return this.toFixedNumber(preTaxTotal, 2);
        },
        postTaxDeductionTotal() {
            let postTaxTotal = 0;
            if (this.userIncome.deductions && this.userIncome.deductions.length > 0) {
                this.userIncome.deductions.forEach(d => {
                    let amount = parseFloat(d.amount);
                    if (d.type === 'posttax') {
                        postTaxTotal += amount;
                    }
                });
            }
            return this.toFixedNumber(postTaxTotal, 2);
        },
        regularHoursPerWeek() {
            if (this.userIncome.hoursPerWeek > 40) {
                return 40;
            } else {
                return this.userIncome.hoursPerWeek;
            }
        },
        overTimeHours() {
            if (this.userIncome.hoursPerWeek > 40) {
                return this.userIncome.hoursPerWeek - 40;
            } else {
                return 0;
            }
        },
        overTimeHourlyRate() {
            return this.userIncome.hourlyRate * 1.5;
        },
        regularPay() {
            return this.userIncome.hourlyRate * this.regularHoursPerWeek * 52;
        },
        overTimePay() {
            return this.overTimeHours * this.overTimeHourlyRate * 52;
        },
        disabilityPay() {
            return this.salary * 12;
        },
        incomeIsTaxExemptIcon() {
            if (this.userIncome && this.userIncome !== null) {
                return this.userIncome.isTaxExempt ? 'check-circle' : 'x-circle';
            }
            return 'check-circle';
        },
        incomeIsActiveLabel() {
            if (this.userIncome && this.userIncome !== null) {
                return this.userIncome.isActive ? 'Active' : 'Inactive';
            }
            return 'Active';
        },
        incomeIsActiveIcon() {
            if (this.userIncome && this.userIncome !== null) {
                return this.userIncome.isActive ? 'check-circle' : 'x-circle';
            }
            return 'check-circle';
        },
        isDisabilityIncome() {
            return this.userIncome.employmentType === 'd';
        },
        showIncomeUpdateModal() {
            return this.isLoaded && this.showConfirmModal;
        },
        showIncomePreviewModal() {
            return !this.isLoaded && this.showConfirmModal;
        },
        upsertButtonLabel() {
            return this.isLoaded ? 'Update' : 'Create';
        },
        activeLabel() {
            return this.userIncome.isActive ? 'is-active-label' : 'is-inactive-label';
        },
        taxExemptLabel() {
            return this.userIncome.isTaxExempt ? 'is-active-label' : 'is-inactive-label';
        }
    },
    data() {
        return {
            federalTaxRate: 0,
            federalTaxAmount: 0,
            stateTaxRate: 0,
            stateTaxAmount: 0,
            ficaTaxAmount: 0,
            filingStatus: [
                { option: 'Single', value: 's' },
                { option: 'Married', value: 'm' },
                { option: 'Head of Household', value: 'h' },
            ],
            salary: 0,
            netIncome: 0,
            isLoaded: false,
            userIncome: {
                userId: null,
                id: null,
                name: null,
                type: null,
                salary: 0,
                netSalary: 0,
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
            incomeType: [
                { option: 'Hourly', value: 'h' },
                { option: 'Salary', value: 's' },
                { option: 'Disability', value: 'd' }
            ],
            employmentType: [
                { option: 'Part Time', value: 'pt' },
                { option: 'Full Time', value: 'ft' },
                { option: 'Contractor', value: 'c' },
                { option: 'Disability', value: 'd' },
            ],
            payPeriods: [
                { option: 'Weekly', value: 52 },
                { option: 'Bi-Weekly', value: 26 },
                { option: 'Bi-Monthly', value: 24 },
                { option: 'Monthly', value: 12 },
            ],
            showConfirmModal: false,
            deduction: {
                name: null,
                amount: null,
                type: null
            },
            deductionTypes: [
                { option: 'Pre-Tax', value: 'pretax'},
                { option: 'Post-Tax', value: 'posttax'}
            ],
            errors: [],
            deductionErrors: []
        }
    },
    methods: {
        ...mapActions(mainStore, ['createIncome', 'updateIncome', 'getIncomeById']),
        addDeduction() {
            if (this.validateDeductionFields()) {
                this.deduction.amount = this.toFixedNumber(this.deduction.amount, 2);
                this.userIncome.deductions.push(this.deduction);
                this.deduction = {
                    name: null,
                    amount: null,
                    type: null
                };
            }
        },
        resetDeductions() {
            this.userIncome.deductions = [];
            this.deduction = {
                name: null,
                amount: null,
                type: null
            };
        },
        calculateNetIncome() {
            if (this.validateIncomeFields()) {
                if (!this.isLoaded) 
                    this.userIncome.id = this.generateGUID();
                this.userIncome.userId = this.getUserId;
                this.userIncome.salary = this.calculateSalary();
                const preTaxDeductedIncome = this.userIncome.salary - (this.preTaxDeductionTotal * this.userIncome.payPeriod);
                this.setFederalTaxRate(preTaxDeductedIncome);
                this.setStateTaxRate(preTaxDeductedIncome);
                this.netIncome = preTaxDeductedIncome - (this.postTaxDeductionTotal * this.userIncome.payPeriod) - (preTaxDeductedIncome * (this.stateTaxRate / 100) + ((preTaxDeductedIncome) * (this.federalTaxRate / 100)) + this.getFICATaxAmount(preTaxDeductedIncome));
                this.userIncome.netSalary = this.toFixedNumber(this.netIncome, 2);
                if(this.netIncome > 0)
                    this.toggleShowConfirmModal();
            }
        },
        calculateSalary() {
            let pay = 0;
            switch (this.userIncome.type) {
                case 'h':
                    pay = this.regularPay + this.overTimePay;
                    break;
                case 'd': 
                    pay = this.disabilityPay;
                    break;
                default:
                    pay = this.salary;
                    break;
            }
            return this.toFixedNumber(pay, 2);
        },
        saveIncome() {
            this.createIncome(this.userIncome).then(() => this.$router.push('/income'));
        },
        updateUserIncome() {
            this.updateIncome(this.userIncome).then(() => this.$router.push('/income'));
        },
        loadIncome(id) {
            this.getIncomeById(id).then((i) => {
                this.userIncome = JSON.parse(JSON.stringify(i));
                this.salary = this.userIncome.type === 'd' ? this.toFixedNumber(this.userIncome.salary / 12, 2) : this.userIncome.salary;
                this.toggleIsLoaded();
            }).catch((err) => {
                console.log(err.message);
                this.$router.push('/income');
            });
        },
        cancelIncome() {
            this.$router.push('/income');
        },
        setFederalTaxRate(preTaxDeductedIncome){
            if (this.userIncome.isTaxExempt) {
                this.federalTaxRate = 0;
                this.federalTaxAmount = 0;
                return;
            }
            const federal = this.federalTaxBrackets.filter(ft => {
                return ft.filing_status === this.userIncome.filingStatus && ft.incomeMin < preTaxDeductedIncome && ft.incomeMax > preTaxDeductedIncome;
            });
            if(federal && federal.length > 0) {
                this.federalTaxRate = parseFloat(federal[0].rate);
            }
            const fedTaxRatePct = this.federalTaxRate / 100;
            this.federalTaxAmount = this.toFixedNumber(preTaxDeductedIncome * fedTaxRatePct, 2);
        },
        setStateTaxRate(preTaxDeductedIncome) {
            if (this.userIncome.isTaxExempt) {
                this.stateTaxRate = 0;
                this.stateTaxAmount = 0;
                return;
            }
            const state = this.stateTaxBrackets.filter(s => {
                return s.filing_status === this.selectedStateFilingStatus && s.incomeMin < preTaxDeductedIncome && s.state === this.userIncome.state;
            });
            if(state && state.length > 0) {
                state.sort((a,b) => {
                    let x = typeof a.rate === 'number' ? a.rate : parseFloat(a.rate);
                    let y = typeof b.rate === 'number' ? b.rate : parseFloat(b.rate);
                    if (x < y) { return 1 }
                    if (x > y) { return -1 }
                    return 0;
                });
                this.stateTaxRate = state[0].rate;
                this.stateTaxAmount = this.toFixedNumber(preTaxDeductedIncome * (this.stateTaxRate / 100), 2);
            }
        },
        setUserIncomeType() {
            if (this.userIncome.employmentType === 'd') {
                this.userIncome.type = 'd';
                this.setPayPeriod('Monthly');
            } else {
                this.userIncome.type = null;
            }
        },
        setUserEmploymentType() {
            if (this.userIncome.type === 'd') {
                this.userIncome.employmentType = 'd';
                this.setPayPeriod('Monthly');
            }
        },
        setPayPeriod(selection) {
            switch (selection) {
                case 'Bi-Weekly':
                    this.userIncome.payPeriod = 26;
                    break;
                case 'Bi-Monthly':
                    this.userIncome.payPeriod = 24;
                    break;
                case 'Monthly':
                    this.userIncome.payPeriod = 12;
                    break;            
                default:
                    this.userIncome.payPeriod = 52;
                    break;
            }
        },
        getFICATaxAmount(preTaxDeductedIncome) {
            let amount = 0;
            if (this.userIncome.isTaxExempt) {
                return amount;
            }
            if(this.ficaRate && this.ficaRate.length > 0) {
                this.ficaRate.forEach(fr => {
                    let ficaAmount = preTaxDeductedIncome * (parseFloat(fr.rate) / 100);
                    amount += ficaAmount;
                });
            }
            this.ficaTaxAmount = amount;
            return amount;
        },
        validateIncomeFields() {
            this.errors = [];
            let i = this.userIncome;
            if (!i.name || i.name === null) {
                this.errors.push({ message: 'Name entry is required!', field: 'incomeName' });
            }
            if (i.name && i.name.length > 10) {
                this.errors.push({ message: 'Name cannot exceed 10 characters!', field: 'incomeName' });
            }
            if ((!i.state || i.state == null) && !i.isTaxExempt) {
                this.errors.push({ message: 'State selection is required!', field: 'selectedState' });
            }
            if ((!i.filingStatus || i.filingStatus === null) && !i.isTaxExempt) {
                this.errors.push({ message: 'Filing Status is selection required!', field: 'filingStatus' });
            }
            if (!i.employmentType || i.employmentType === null) {
                this.errors.push({ message: 'Employment Type selection is required!', field: 'employmentType' });
            }
            if (!i.payPeriod || i.payPeriod === null) {
                this.errors.push({ message: 'Pay Period selection is required!', field: 'payPeriod' });
            }
            if (!i.type || i.type === null) {
                this.errors.push({ message: 'Income Type selection is required!', field: 'incomeType'});
            }
            if ((!i.hourlyRate || i.hourlyRate <= 0 || isNaN(i.hourlyRate)) && i.type === 'h') {
                this.errors.push({ message: 'Hourly Rate entry is required if "Hourly" is the selected Income Type!', field: 'hourlyRate' });
            }
            if ((!i.hoursPerWeek || i.hoursPerWeek <= 0 || isNaN(i.hoursPerWeek)) && i.type === 'h') {
                this.errors.push({ message: 'Hours Per Week entry is required if "Hourly" is the selected Income Type!', field: 'hoursPerWeek' });
            }
            if ((!this.salary || this.salary <= 0 || isNaN(this.salary)) && i.type === 's') {
                this.errors.push({ message: 'Salary Amount entry is required if "Salary" is the selected Income Type!', field: 'salary' });
            }
            return this.errors.length <= 0;
        },
        validateDeductionFields() {
            this.deductionErrors = [];
            let d = this.deduction;
            if (!d.name || d.name === null) {
                this.deductionErrors.push({ message: 'Name is required for a deduction!', field: 'deductionName' });
            }
            if (!d.amount || d.amount === null || isNaN(d.amount)) {
                this.deductionErrors.push({ message: 'Deduction Amount is required!', field: 'deductionAmount' });
            }
            if (!d.type || d.type === null) {
                this.deductionErrors.push({ message: 'Deduction type is required!', field: 'deductionType' });
            }
            return this.deductionErrors.length <= 0
        },
        validationFailed(field, errors) {
            let found = errors.find(err => err.field === field) !== undefined;
            return found;
        },
        getErrorMessage(field, errors) {
            if (errors.length <= 0) {
                return null;
            } else {
                let found = errors.find(err => err.field === field);
                if (found && found !== null) {
                    return `*${found.message}`;
                } else {
                    return `No errors for '${field}'`
                }
            }
        },
        isOdd(num) {
            const oddResult = (num + 1) % 2;
            let result = oddResult === 1;
            return result;
        },
        toggleTaxExempt() {
            this.userIncome.isTaxExempt = !this.userIncome.isTaxExempt;
            this.userIncome.filingStatus = this.userIncome.isTaxExempt ? null : this.userIncome.filingStatus;
            this.userIncome.state = this.userIncome.isTaxExempt ? null : this.userIncome.state;
        },
        toggleIsLoaded() {
            this.isLoaded = !this.isLoaded;
        },
        toggleShowConfirmModal() {
            this.showConfirmModal = !this.showConfirmModal;
        },
        toggleIncomeIsActive() {
            this.userIncome.isActive = !this.userIncome.isActive;
        },
        removeDeduction(deduction) {
            const index = this.userIncome.deductions.findIndex(d => d.name === deduction.name && d.type === deduction.type && d.amount === deduction.amount);
            if (index > -1) {
                this.userIncome.deductions.splice(index, 1);
            }
        },
        toFixedNumber(num, digits, base){
            var pow = Math.pow(base||10, digits);
            return Math.round(num*pow) / pow;
        }
    }
})
</script>
<template>
    <div :class="$style['page-layout']">
        <h2>{{isLoaded ? `Edit Income` : 'New Income'}}</h2>
        <div
            :class="$style['field-group']"
        >
            <label for="income-name">Name</label>
            <div v-if="validationFailed('incomeName', errors)" class="error-detail" >{{getErrorMessage('incomeName', errors)}}</div>
            <input id="income-name" :class="validationFailed('incomeName', errors) && 'error-detail-input'" type="text" v-model="userIncome.name" />
        </div>
        <div
            :class="$style['button-group']"
        >
            <button
                :class="$style[taxExemptLabel]"
                :width="20"
                @click="toggleTaxExempt"
            >
                <BaseIcon
                    :name="incomeIsTaxExemptIcon"
                >
                    Tax Exempt
                </BaseIcon>
            </button>
            <button
                v-if="isLoaded"
                :class="$style[activeLabel]"
                @click="toggleIncomeIsActive()"
            >
                <BaseIcon
                    :name="incomeIsActiveIcon"
                >
                        {{ incomeIsActiveLabel }}
                </BaseIcon>
            </button>
        </div>
        <div
            v-if="!userIncome.isTaxExempt"
            :class="$style['field-group']"
        >
            <label>State</label>
            <div v-if="validationFailed('selectedState', errors)" class="error-detail">{{getErrorMessage('selectedState', errors)}}</div>
            <select v-model="userIncome.state" :class="validationFailed('selectedState', errors) && 'error-detail-input'">
                <option :value="null" hidden selected>State</option>
                <option v-for="state in states" :key="state.id" :value="state.abbreviation">{{state.name}}</option>
            </select>
            <label>Filing Status</label>
            <div v-if="validationFailed('filingStatus', errors)" class="error-detail">{{getErrorMessage('filingStatus', errors)}}</div>
            <select v-model="userIncome.filingStatus" :class="validationFailed('filingStatus', errors) && 'error-detail-input'">
                <option :value="null" hidden selected>Filing Status</option>
                <option v-for="filing in filingStatus" :key="filing.value" :value="filing.value">{{filing.option}}</option>
            </select>
        </div>
        <div
            :class="$style['field-group']"
        >
            <label>Employment Type</label>
            <div v-if="validationFailed('employmentType', errors)" class="error-detail">{{getErrorMessage('employmentType', errors)}}</div>
            <select v-model="userIncome.employmentType" @change="setUserIncomeType" :class="validationFailed('employmentType', errors) && 'error-detail-input'">
                <option :value="null" hidden selected>Employment Type</option>
                <option v-for="types in employmentType" :key="types.value" :value="types.value">{{ types.option }}</option>
            </select>
            <label>Pay Period</label>
            <div v-if="validationFailed('payPeriod', errors)" class="error-detail">{{getErrorMessage('payPeriod', errors)}}</div>
            <select v-model="userIncome.payPeriod" :class="validationFailed('payPeriod', errors) && 'error-detail-input'">
                <option :value="null" hidden selected>Pay Period</option>
                <option v-for="period in payPeriods" :key="period.value" :value="period.value">{{period.option}}</option>
            </select>
            <label>Income Type</label>
            <div v-if="validationFailed('incomeType', errors)" class="error-detail">{{getErrorMessage('incomeType', errors)}}</div>
            <select v-model="userIncome.type" :disabled="isDisabilityIncome" @change="setUserEmploymentType" :class="validationFailed('incomeType', errors) && 'error-detail-input'">
                <option :value="null" hidden selected>Income Type</option>
                <option v-for="types in incomeType" :key="types.value" :value="types.value">{{types.option}}</option>
            </select>
        </div>
        <div
            v-if="userIncome.type === 'h'"
            :class="$style['field-group']"
        >
            <label>Hourly Rate</label>
            <div v-if="validationFailed('hourlyRate', errors)" class="error-detail">{{getErrorMessage('hourlyRate', errors)}}</div>
            <input type="number" v-model.number="userIncome.hourlyRate" :class="validationFailed('hourlyRate', errors) && 'error-detail-input'"/>
            <label>Hours per week</label>
            <div v-if="validationFailed('hoursPerWeek', errors)" class="error-detail">{{getErrorMessage('hoursPerWeek', errors)}}</div>
            <input type="number" v-model.number="userIncome.hoursPerWeek" :class="validationFailed('hoursPerWeek', errors) && 'error-detail-input'"/>
        </div>
        <div
            v-if="userIncome.type === 's' || userIncome.type === 'd'"
            :class="$style['field-group']"
        >
            <label>Salary Amount</label>
            <div v-if="validationFailed('salary', errors)" class="error-detail">{{getErrorMessage('salary', errors)}}</div>
            <input type="number" v-model.number="salary" :class="validationFailed('salary', errors) && 'error-detail-input'"/>
        </div>
        <div :class="$style['field-group']">
            <label>Deduction Name</label>
            <div v-if="validationFailed('deductionName', deductionErrors)" class="error-detail">{{getErrorMessage('deductionName', deductionErrors)}}</div>
            <input type="text" v-model="deduction.name" :class="validationFailed('deductionName', deductionErrors) && 'error-detail-input'"/>
            <label>Deduction Amount</label>
            <div v-if="validationFailed('deductionAmount', deductionErrors)" class="error-detail">{{getErrorMessage('deductionAmount', deductionErrors)}}</div>
            <input type="number" v-model="deduction.amount" :class="validationFailed('deductionAmount', deductionErrors) && 'error-detail-input'">
            <label>Deduction Type</label>
            <div v-if="validationFailed('deductionType', deductionErrors)" class="error-detail">{{getErrorMessage('deductionType', deductionErrors)}}</div>
            <select v-model="deduction.type" :class="validationFailed('deductionType', deductionErrors) && 'error-detail-input'">
                <option :value="null" hidden selected>Deduction Type</option>
                <option v-for="deductionType in deductionTypes" :key="deductionType.value" :value="deductionType.value">{{deductionType.option}}</option>
            </select>
            <div :class="$style['button-group']">
                <button @click="addDeduction">Add Deduction</button>
                <button v-if="userIncome.deductions.length > 0" @click="resetDeductions">Reset Deductions</button>
            </div>
        </div>
        <ul
            v-if="hasPreTaxDeductions"
            :class="$style['deduction-panel']"
        >
            <li :class="$style['deduction-header']">Pre-Tax Deductions</li>
            <li
                :class="[
                    $style['deduction-item'],
                    isOdd(index) && $style['is-odd']
                ]"
                v-for="(deduction, index) in preTaxDeductions"
                :key="`pre-tax-deduction-${index}`"
            >
                <div>
                    <p>{{ deduction.name }}</p>
                </div>
                <div>
                    <p>{{ toCurrency(deduction.amount) }}</p>
                </div>
                <div>
                    <button
                        :class="$style['deduction-button']"
                        @click="removeDeduction(deduction)"
                    >
                        <BaseIcon name="delete"/>
                    </button>
                </div>
            </li>
        </ul>
        <ul
            v-if="hasPostTaxDeductions"
            :class="$style['deduction-panel']"
        >
            <li :class="$style['deduction-header']">Post-Tax Deductions</li>
            <li
                :class="[
                    $style['deduction-item'],
                    isOdd(index) && $style['is-odd']
                ]"
                v-for="(deduction, index) in postTaxDeductions"
                :key="`post-tax-deduction-${index}`"
            >
                <div>
                    <p>{{ deduction.name }}</p>
                </div>
                <div>
                    <p>{{ toCurrency(deduction.amount) }}</p>
                </div>
                <div>
                    <button
                        :class="$style['deduction-button']"
                        @click="removeDeduction(deduction)"
                    >
                        <BaseIcon name="delete"/>
                    </button>
                </div>
            </li>
        </ul>
        <BaseModal v-if="showIncomePreviewModal">
            <template #header>
                <div :class="$style['input-modal-header']">
                    <h3>{{ userIncome.name }}</h3>
                </div>
            </template>
            <template #body>
                <h4>Gross Income</h4>
                <p>{{ toCurrency(userIncome.salary) }}</p>
                <h4>Gross Paycheck Amount</h4>
                <p>{{ toCurrency(amountGrossPerCheck) }}</p>
                <h4>Net Income</h4>
                <p>{{ toCurrency(netIncome) }}</p>
                <h4>Net Paycheck Amount</h4>
                <p>{{ toCurrency(amountPerPaycheck) }}</p>
                <h4>Pre-Tax Deductions</h4>
                <p>{{ toCurrency(preTaxDeductionTotal) }}</p>
                <h4>Post-Tax Deductions</h4>
                <p>{{ toCurrency(postTaxDeductionTotal) }}</p>
                <h4>Paydays Per Year</h4>
                <p>{{ userIncome.payPeriod }}</p>
            </template>
            <template #footer>
                <div :class="$style['button-group']">
                    <button @click="saveIncome()">Save</button>
                    <button @click="toggleShowConfirmModal">Cancel</button>
                </div>
            </template>
        </BaseModal>
        <BaseModal v-if="showIncomeUpdateModal">
            <template #header>
                <h3>Confirm Update</h3>
            </template>
            <template #body>
                <div>
                    <span>Update <b><i>{{userIncome.name}}</i></b>?</span>
                </div>
            </template>
            <template #footer>
                <div :class="$style['button-group']">
                    <button @click="updateUserIncome()">Update</button>
                    <button @click="toggleShowConfirmModal">Cancel</button>
                </div>
            </template>
        </BaseModal>
        <div :class="$style['button-group']">
            <button @click="calculateNetIncome()">{{ upsertButtonLabel }}</button>
            <button @click="cancelIncome">Cancel</button>   
        </div>
    </div>
</template>
<style lang="scss" module>
.page-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.deduction-panel {
    display: flex;
    flex-direction: column;
}
.deduction-item {
    display: flex;
    align-items: center;
    background: $dark-purple;
    color: $white;
    font-size: $font-size-large;
    border: solid 1px $white;
    padding: 5px 10px;
    &.is-odd {
        background: $purple;
    }
    @media (min-width: 320px) and (max-width: 768px){
        font-size: .95rem;
    }
    div {
        display: flex;
        justify-content: center;
        flex: 1;
    }
    :first-child {
        justify-content: flex-start;
    }
    :last-child {
        justify-content: flex-end;
    }
    &:last-child {
        border-radius: 0 0 25px 25px;
    }
}
.deduction-header {
    background: $dark-purple;
    font-size: $font-size-xlarge;
    text-align: center;
    border: 1px solid $white;
    border-radius: 25px 25px 0 0;
}
.deduction-button {
    background: $error-bg-color;
    --icon-stroke: #{$error-bg-color-dark};
    border: 2px solid $error-bg-color-dark;
    &:hover {
        background: $error-bg-color-light;
        --icon-stroke: #{$error-bg-color};
        border: 2px solid $error-bg-color;
    }
}
.input-modal-header {
    display: flex;
    justify-content: center;
}
.is-active-label {
    background: $success-bg-color;
    border: solid 2px $success-bg-color-dark;
    border-radius: $border-radius-medium;
    --icon-stroke: #{$success-bg-color-dark};
    color: $success-bg-color-dark;
    cursor: pointer;
    padding: 10px;
    &:hover {
        color: $success-bg-color-dark;
        background: $success-bg-color-light;
    }
}
.is-inactive-label {
    background: $error-bg-color;
    border: solid 2px $error-bg-color-dark;
    border-radius: $border-radius-medium;
    --icon-stroke: #{$error-bg-color-dark};
    color: $error-bg-color-dark;
    cursor: pointer;
    padding: 10px;
    &:hover {
        color: $error-bg-color-dark;
        background: $error-bg-color-light;
    }
}
.field-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-weight: $font-weight-bold;
}
.button-group {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    button {
        flex: 1;
    }
    @media (min-width: 320px) and (max-width: 768px){
        align-items: stretch;
        button {
            --icon-font-size: #{$font-size-small};
        }
    }
}
</style>