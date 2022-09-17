<script>
import BaseModal from '../components/BaseModal';
import BaseIcon from '../components/BaseIcon';
import DatePicker from 'vue3-date-time-picker';
import { toCurrencyMixin, guid } from '../mixins/GlobalMixin';
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BaseModal,
        BaseIcon,
        DatePicker,
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
        hideDeductionList() {
            if (this.userIncome.deductions.length > 0) {
                return false;
            } else {
                return this.hideDeductions;
            }
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
                deductions: [],
                payDate: null,
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
            hideDeductions: true,
            showConfirmModal: false,
            deduction: {
                name: null,
                amount: 0,
                type: null
            },
            deductionTypes: [
                { option: 'Pre-Tax', value: 'pretax'},
                { option: 'Post-Tax', value: 'posttax'}
            ],
            selectedPayDate: null,
            format: 'M/d/yyyy',
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
                    amount: 0,
                    type: null
                };
            }
        },
        resetDeductions() {
            this.userIncome.deductions = [];
            this.deduction = {
                name: null,
                amount: 0,
                type: null
            };
        },
        setIncomePayDate() {
            const baseDate = new Date(null);
            let incomeDate = new Date();
            if (this.selectedPayDate) {
                incomeDate = new Date(this.selectedPayDate);
                if (incomeDate !== baseDate) this.userIncome.payDate = incomeDate.toLocaleDateString();
            }
        },
        calculateNetIncome() {
            if (this.validateIncomeFields()) {
                if (!this.isLoaded) 
                    this.userIncome.id = this.generateGUID();
                this.setIncomePayDate();
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
        toggleHideDeductions() {
            this.hideDeductions = !this.hideDeductions;
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
    <div>
        <h1>{{isLoaded ? `${userIncome.name} Income` : 'New Income'}}</h1>
        <div class="tile is-ancestor">
            <div class="tile is-parent">
                <div class="tile is-3 is-child">
                    <label>Name</label><br/>
                    <div v-if="validationFailed('incomeName', errors)" class="error-detail" >{{getErrorMessage('incomeName', errors)}}</div>
                    <input class="input is-rounded" type="text" v-model="userIncome.name" />
                </div>
                <div class="tile is-3 is-child">&nbsp;</div>
                <div class="tile is-3 is-child is-padded" @click="toggleTaxExempt()">
                    <div>
                        <BaseIcon :name="incomeIsTaxExemptIcon" :class="{ 'is-active-label' : userIncome.isTaxExempt, 'is-inactive-label' : !userIncome.isTaxExempt}">Tax Exempt</BaseIcon>
                    </div>
                </div>
                <div v-if="isLoaded" class="tile is-3 is-child is-padded" @click="toggleIncomeIsActive()">
                    <div>
                        <BaseIcon :name="incomeIsActiveIcon" :class="{'is-active-label' : userIncome.isActive, 'is-inactive-label' : !userIncome.isActive}">{{incomeIsActiveLabel}}</BaseIcon>
                    </div>
                </div>
            </div>
        </div>
        <div class="tile is-ancestor">
            <div class="tile is-parent">
                <div v-if="!userIncome.isTaxExempt" class="tile is-3 is-child">
                    <label>State</label><br/>
                    <div v-if="validationFailed('selectedState', errors)" class="error-detail">{{getErrorMessage('selectedState', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="userIncome.state">
                            <option :value="null" hidden selected>State</option>
                            <option v-for="state in states" :key="state.id" :value="state.abbreviation">{{state.name}}</option>
                        </select>
                    </div>
                </div>
                <div v-if="!userIncome.isTaxExempt" class="tile is-3 is-child">
                    <label>Filing Status</label><br/>
                    <div v-if="validationFailed('filingStatus', errors)" class="error-detail">{{getErrorMessage('filingStatus', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="userIncome.filingStatus">
                            <option :value="null" hidden selected>Filing Status</option>
                            <option v-for="filing in filingStatus" :key="filing.value" :value="filing.value">{{filing.option}}</option>
                        </select>
                    </div>
                </div>
                <div class="tile is-3 is-child">
                    <label>Employment Type</label><br/>
                    <div v-if="validationFailed('employmentType', errors)" class="error-detail">{{getErrorMessage('employmentType', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="userIncome.employmentType" @change="setUserIncomeType">
                            <option :value="null" hidden selected>Employment Type</option>
                            <option v-for="types in employmentType" :key="types.value" :value="types.value">{{ types.option }}</option>
                        </select>
                    </div>
                </div>
                <div class="tile is-3 is-child is-vertical">
                    <label>Pay Period</label><br/>
                    <div v-if="validationFailed('payPeriod', errors)" class="error-detail">{{getErrorMessage('payPeriod', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="userIncome.payPeriod">
                            <option :value="null" hidden selected>Pay Period</option>
                            <option v-for="period in payPeriods" :key="period.value" :value="period.value">{{period.option}}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="tile is-ancestor">
            <div class="tile is-vertical is-9">
                <div class="tile">
                    <div class="tile is-parent is-4 is-vertical">
                        <div class="tile is-12 is-child">
                            <label>Income Type</label><br/>
                            <div v-if="validationFailed('incomeType', errors)" class="error-detail">{{getErrorMessage('incomeType', errors)}}</div>
                            <div class="select is-rounded is-medium">
                                <select v-model="userIncome.type" :disabled="isDisabilityIncome" @change="setUserEmploymentType">
                                    <option :value="null" hidden selected>Income Type</option>
                                    <option v-for="types in incomeType" :key="types.value" :value="types.value">{{types.option}}</option>
                                </select>
                            </div>
                        </div>
                        <div v-if="userIncome.type === 'h'" class="tile is-12 is-child">
                            <label>Hourly Rate</label>
                            <div v-if="validationFailed('hourlyRate', errors)" class="error-detail">{{getErrorMessage('hourlyRate', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="userIncome.hourlyRate"/>
                        </div>
                        <div v-if="userIncome.type === 'h'" class="tile is-12 is-child">
                            <label>Hours per week</label>
                            <div v-if="validationFailed('hoursPerWeek', errors)" class="error-detail">{{getErrorMessage('hoursPerWeek', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="userIncome.hoursPerWeek"/>
                        </div>
                        <div v-if="userIncome.type === 's' || userIncome.type === 'd'" class="tile is-12 is-child">
                            <label>Salary Amount</label>
                            <div v-if="validationFailed('salary', errors)" class="error-detail">{{getErrorMessage('salary', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="salary"/>
                        </div>
                        <label>Next Pay Date</label>
                        <DatePicker v-model="selectedPayDate" :format="format" :enableTimePicker="false" :autoApply="true" class='is-medium'></DatePicker>
                    </div>
                    <div class="tile is-parent is-4 is-vertical">
                        <div class="tile is-12 is-child notification is-deduction-panel toggle-deductions" @click="toggleHideDeductions">
                            <label class="toggle-deductions">Deductions</label>
                            <label class="is-pulled-right toggle-deductions">
                                <BaseIcon v-if="hideDeductions" name="chevron-down"></BaseIcon>
                                <BaseIcon v-if="!hideDeductions" name="chevron-up"></BaseIcon>
                            </label>
                        </div>
                        <div v-if="!hideDeductions" class="tile is-12 is-child">
                            <label>Deduction Name</label>
                            <div v-if="validationFailed('deductionName', deductionErrors)" class="error-detail">{{getErrorMessage('deductionName', deductionErrors)}}</div>
                            <input class="input is-rounded" type="text" v-model="deduction.name"/>
                        </div>
                        <div v-if="!hideDeductions" class="tile is-12 is-child">
                            <label>Deduction Amount</label>
                            <div v-if="validationFailed('deductionAmount', deductionErrors)" class="error-detail">{{getErrorMessage('deductionAmount', deductionErrors)}}</div>
                            <input class="input is-rounded" type="number" v-model="deduction.amount">
                        </div>
                        <div v-if="!hideDeductions" class="tile is-12 is-child">
                            <label>Deduction Type</label>
                            <div v-if="validationFailed('deductionType', deductionErrors)" class="error-detail">{{getErrorMessage('deductionType', deductionErrors)}}</div>
                            <div class='select is-rounded is-medium'>
                                <select v-model="deduction.type">
                                    <option :value="null" hidden selected>Deduction Type</option>
                                    <option v-for="deductionType in deductionTypes" :key="deductionType.value" :value="deductionType.value">{{deductionType.option}}</option>
                                </select>
                            </div>
                        </div>
                        <div v-if="!hideDeductions" class="tile is-12 is-child">
                            <button @click="addDeduction">Add Deduction</button>
                            <button v-if="userIncome.deductions.length > 0" @click="resetDeductions">Reset Deductions</button>
                        </div>
                    </div>
                    <div v-if="!hideDeductionList" class="tile is-parent is-8 is-vertical">
                        <div class="tile is-12 is-child">
                            <ul>
                                <li class="deduction-header">Pre-Tax Deductions</li>
                                <li :class="{'deduction-item' : isOdd(index)}" v-for="(deduction, index) in preTaxDeductions" :key="`deduction-${index}`">
                                    <div class="level is-mobile is-padded">
                                        <div class="level-item has-text-centered">
                                            <div>
                                                <span class="title is-4">{{deduction.name}}</span>
                                            </div>
                                        </div>
                                        <div class="level-item has-text-centered">
                                            <div>
                                                <span class="title is-4">{{ toCurrency(deduction.amount) }}</span>
                                            </div>
                                        </div>
                                        <div class="level-item">
                                            <div @click="removeDeduction(deduction)">
                                                <span class="title is-4 is-pulled-right button is-danger"><BaseIcon name="delete"></BaseIcon></span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="tile is-12 is-child">
                            <ul>
                                <li class="deduction-header">Post-Tax Deductions</li>
                                <li :class="{'deduction-item' : isOdd(index)}" v-for="(deduction, index) in postTaxDeductions" :key="`deduction-${index}`">
                                    <div class="level is-mobile is-padded">
                                        <div class="level-item has-text-centered">
                                            <div>
                                                <span class="title is-4">{{deduction.name}}</span>
                                            </div>
                                        </div>
                                        <div class="level-item has-text-centered">
                                            <div>
                                                <span class="title is-4">{{ toCurrency(deduction.amount) }}</span>
                                            </div>
                                        </div>
                                        <div class="level-item">
                                            <div @click="removeDeduction(deduction)">
                                                <span class="title is-4 is-pulled-right button is-danger"><BaseIcon name="delete"></BaseIcon></span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BaseModal v-if="showIncomePreviewModal">
            <template #header>
                <h3>{{userIncome.name}}</h3>
            </template>
            <template #body>
                <div>
                    <br/>
                    <label>Gross Income</label><br/>
                    <span>{{ toCurrency(userIncome.salary) }}</span><br/>
                    <label>Gross Paycheck Amount</label><br/>
                    <span>{{ toCurrency(amountGrossPerCheck) }}</span><br/>
                    <label>Net Income</label><br/>
                    <span>{{ toCurrency(netIncome) }}</span><br/>
                    <label>Net Paycheck Amount</label><br/>
                    <span>{{ toCurrency(amountPerPaycheck) }}</span><br/>
                    <label>Pre-Tax Deductions</label><br/>
                    <span>{{ toCurrency(preTaxDeductionTotal) }}</span><br/>
                    <label>Post-Tax Deductions</label><br/>
                    <span>{{ toCurrency(postTaxDeductionTotal) }}</span><br/>
                    <label>Paydays Per Year</label><br/>
                    <span>{{userIncome.payPeriod}}</span><br/>
                    <label v-if="userIncome.payDate">Next Payday</label><br/>
                    <span v-if="userIncome.payDate">{{userIncome.payDate}}</span>
                </div>
            </template>
            <template #footer>
                <div>
                    <button class="is-pulled-right" @click="toggleShowConfirmModal">Cancel</button>
                    <button class="is-pulled-right" @click="saveIncome()">Save</button>
                    <br/><br/>
                </div>
            </template>
        </BaseModal>
        <BaseModal v-if="showIncomeUpdateModal">
            <template #header>
                <h3>Confirm Update</h3>
            </template>
            <template #body>
                <div>
                    <span>Update <strong><i>{{userIncome.name}}</i></strong>?</span>
                </div>
            </template>
            <template #footer>
                <div>
                    <button class="is-pulled-right" @click="toggleShowConfirmModal">Cancel</button>
                    <button class="is-pulled-right" @click="updateUserIncome()">Update</button>
                    <br/><br/>
                </div>
            </template>
        </BaseModal>
        <button @click="calculateNetIncome()">{{ upsertButtonLabel }}</button>
        <button @click="cancelIncome">Cancel</button>   
    </div>
</template>
<style scoped>
span {
    color:whitesmoke;
}
strong {
    color:whitesmoke;
}
i {
    color:whitesmoke;
}
ul {
    color:whitesmoke;
    background-color: #411159;
    border: solid 1px whitesmoke;
    font-size: large;
}
.deduction-item {
    background-color: #8834B3;
    color: whitesmoke;
    font-size: large;
    border: solid 1px whitesmoke;
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
.is-padded {
    padding: 10px;
}
.is-active-label {
    background-color: forestgreen;
    border: solid 2px whitesmoke;
    border-radius: 25px;
    cursor: pointer;
    padding: 10px;
}
.is-inactive-label {
    background-color: crimson;
    border: solid 2px whitesmoke;
    border-radius: 25px;
    cursor: pointer;
    padding: 10px;
}
</style>