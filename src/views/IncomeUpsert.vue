<template>
    <div>
        <h1>Your Income</h1>
        <div class="tile is-ancestor">
            <div class="tile is-parent">
                <div class="tile is-3 is-child">
                    <label>Name</label><br/>
                    <div v-if="validationFailed('incomeName', errors)" class="error-detail" >{{getErrorMessage('incomeName', errors)}}</div>
                    <input class="input is-rounded" type="text" v-model="income.name" />
                </div>
                <div class="tile is-3 is-child">&nbsp;</div>
                <div class="tile is-3 is-child is-padded" @click="toggleTaxExempt()">
                    <div>
                        <BaseIcon :name="incomeIsTaxExemptIcon" :class="{ 'is-active-label' : income.isTaxExempt, 'is-inactive-label' : !income.isTaxExempt}">Tax Exempt</BaseIcon>
                    </div>
                </div>
                <div v-if="isLoaded" class="tile is-3 is-child is-padded" @click="toggleIncomeIsActive()">
                    <div>
                        <BaseIcon :name="incomeIsActiveIcon" :class="{'is-active-label' : income.isActive, 'is-inactive-label' : !income.isActive}">{{incomeIsActiveLabel}}</BaseIcon>
                    </div>
                </div>
            </div>
        </div>
        <div class="tile is-ancestor">
            <div class="tile is-parent">
                <div v-if="!income.isTaxExempt" class="tile is-3 is-child">
                    <label>State</label><br/>
                    <div v-if="validationFailed('selectedState', errors)" class="error-detail">{{getErrorMessage('selectedState', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="income.state">
                            <option :value="null" hidden selected>State</option>
                            <option v-for="state in states" :key="state.id" :value="state.abbreviation">{{state.name}}</option>
                        </select>
                    </div>
                </div>
                <div v-if="!income.isTaxExempt" class="tile is-3 is-child">
                    <label>Filing Status</label><br/>
                    <div v-if="validationFailed('filingStatus', errors)" class="error-detail">{{getErrorMessage('filingStatus', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="income.filingStatus">
                            <option :value="null" hidden selected>Filing Status</option>
                            <option v-for="filing in filingStatus" :key="filing.value" :value="filing.value">{{filing.option}}</option>
                        </select>
                    </div>
                </div>
                <div class="tile is-3 is-child">
                    <label>Employment Type</label><br/>
                    <div v-if="validationFailed('employmentType', errors)" class="error-detail">{{getErrorMessage('employmentType', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="income.employmentType">
                            <option :value="null" hidden selected>Employment Type</option>
                            <option v-for="type in employmentType" :key="type.value" :value="type.value">{{type.option}}</option>
                        </select>
                    </div>
                </div>
                <div class="tile is-3 is-child is-vertical">
                    <label>Pay Period</label><br/>
                    <div v-if="validationFailed('payPeriod', errors)" class="error-detail">{{getErrorMessage('payPeriod', errors)}}</div>
                    <div class="select is-rounded is-medium">
                        <select v-model="income.payPeriod">
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
                                <select v-model="income.type">
                                    <option :value="null" hidden selected>Income Type</option>
                                    <option v-for="type in incomeType" :key="type.value" :value="type.value">{{type.option}}</option>
                                </select>
                            </div>
                        </div>
                        <div v-if="income.type === 'h'" class="tile is-12 is-child">
                            <label>Hourly Rate</label>
                            <div v-if="validationFailed('hourlyRate', errors)" class="error-detail">{{getErrorMessage('hourlyRate', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="income.hourlyRate"/>
                        </div>
                        <div v-if="income.type === 'h'" class="tile is-12 is-child">
                            <label>Hours per week</label>
                            <div v-if="validationFailed('hoursPerWeek', errors)" class="error-detail">{{getErrorMessage('hoursPerWeek', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="income.hoursPerWeek"/>
                        </div>
                        <div v-if="income.type === 's'" class="tile is-12 is-child">
                            <label>Salary Amount</label>
                            <div v-if="validationFailed('salary', errors)" class="error-detail">{{getErrorMessage('salary', errors)}}</div>
                            <input class="input is-rounded" type="number" v-model.number="salary"/>
                        </div>
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
                            <select v-model="deduction.type" >
                                <option :value="null" hidden selected>Deduction Type</option>
                                <option v-for="deductionType in deductionTypes" :key="deductionType.value" :value="deductionType.value">{{deductionType.option}}</option>
                            </select>
                        </div>
                        <div v-if="!hideDeductions" class="tile is-12 is-child">
                            <button @click="addDeduction">Add Deduction</button>
                            <button v-if="income.deductions.length > 0" @click="resetDeductions">Reset Deductions</button>
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
                <h3>{{income.name}}</h3>
            </template>
            <template #body>
                <div>
                    <br/>
                    <label>Gross Income</label><br/>
                    <span>{{ toCurrency(income.salary) }}</span><br/>
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
                    <span>{{income.payPeriod}}</span>
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
                    <span>Update <strong><i>{{income.name}}</i></strong>?</span>
                </div>
            </template>
            <template #footer>
                <div>
                    <button class="is-pulled-right" @click="toggleShowConfirmModal">Cancel</button>
                    <button class="is-pulled-right" @click="updateIncome()">Update</button>
                    <br/><br/>
                </div>
            </template>
        </BaseModal>
        <button @click="calculateNetIncome()">{{ upsertButtonLabel }}</button>
        <button @click="cancelIncome">Cancel</button>   
    </div>
</template>
<script>
import BaseModal from '../components/BaseModal';
import BaseIcon from '../components/BaseIcon';
import { toCurrencyMixin } from '../mixins/GlobalMixin';

export default {
    components: {
        BaseModal: BaseModal,
        BaseIcon: BaseIcon
    },
    mixins: [toCurrencyMixin],
    props: {
        incomeId: null,
    },
    created() {
        this.federalTaxes = this.$store.getters.getFederalTaxes;
        this.stateTaxes = this.$store.getters.getStateTaxes;
        this.ficaRate = this.$store.getters.getFICA;
        this.states = this.$store.getters.getStates;
        if (this.incomeId !== null && parseInt(this.incomeId) !== -1) {
            this.loadIncome(this.incomeId);
        }
    },
    computed: {
        selectedStateTaxes() {
            return this.stateTaxes.filter(s => s.state === this.income.state && s.filing_status === this.selectedStateFilingStatus);
        },
        selectedStateFilingStatus() {
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
        amountPerPaycheck() {
            if (this.netIncome > 0) {
                return this.toFixedNumber(this.netIncome / this.income.payPeriod, 2);
            } else {
                return 0;
            }    
        },
        amountGrossPerCheck() {
            if (this.income.salary > 0) {
                return this.toFixedNumber(this.income.salary / this.income.payPeriod, 2);
            } else {
                return 0;
            }
        },
        postTaxDeductions() {
            return this.income.deductions.filter(d => d.type === 'posttax');
        },
        preTaxDeductions() {
            return this.income.deductions.filter(d => d.type === 'pretax');
        },
        hideDeductionList() {
            if (this.income.deductions.length > 0) {
                return false;
            } else {
                return this.hideDeductions;
            }
        },
        preTaxDeductionTotal() {
            let preTaxTotal = 0;
            if (this.income.deductions && this.income.deductions.length > 0) {
                this.income.deductions.forEach(d => {
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
            if (this.income.deductions && this.income.deductions.length > 0) {
                this.income.deductions.forEach(d => {
                    let amount = parseFloat(d.amount);
                    if (d.type === 'posttax') {
                        postTaxTotal += amount;
                    }
                });
            }
            return this.toFixedNumber(postTaxTotal, 2);
        },
        regularHoursPerWeek() {
            if (this.income.hoursPerWeek > 40) {
                return 40;
            } else {
                return this.income.hoursPerWeek;
            }
        },
        overTimeHours() {
            if (this.income.hoursPerWeek > 40) {
                return this.income.hoursPerWeek - 40;
            } else {
                return 0;
            }
        },
        overTimeHourlyRate() {
            return this.income.hourlyRate * 1.5;
        },
        regularPay() {
            return this.income.hourlyRate * this.regularHoursPerWeek * 52;
        },
        overTimePay() {
            return this.overTimeHours * this.overTimeHourlyRate * 52;
        },
        incomeIsTaxExemptIcon() {
            if (this.income && this.income !== null) {
                return this.income.isTaxExempt ? 'check-circle' : 'x-circle';
            }
            return 'check-circle';
        },
        incomeIsActiveLabel() {
            if (this.income && this.income !== null) {
                return this.income.isActive ? 'Active' : 'Inactive';
            }
            return 'Active';
        },
        incomeIsActiveIcon() {
            if (this.income && this.income !== null) {
                return this.income.isActive ? 'check-circle' : 'x-circle';
            }
            return 'check-circle';
        },
        showIncomeUpdateModal() {
            return this.isLoaded && this.showConfirmModal;
        },
        showIncomePreviewModal() {
            return !this.isLoaded && this.showConfirmModal;
        },
        upsertButtonLabel() {
            return this.isLoaded ? 'Update' : 'Create';
        }
    },
    data() {
        return {
            federalTaxes: [],
            stateTaxes: [],
            ficaRate: [],
            states: [],
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
            income: {
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
            ],
            employmentType: [
                { option: 'Part Time', value: 'pt' },
                { option: 'Full Time', value: 'ft' },
                { option: 'Contractor', value: 'c' },
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
            errors: [],
            deductionErrors: []
        }
    },
    methods: {
        addDeduction() {
            if (this.validateDeductionFields()) {
                this.deduction.amount = this.toFixedNumber(this.deduction.amount, 2);
                this.income.deductions.push(this.deduction);
                this.deduction = {
                    name: null,
                    amount: 0,
                    type: null
                };
            }
        },
        resetDeductions() {
            this.income.deductions = [];
            this.deduction = {
                name: null,
                amount: 0,
                type: null
            };
        },
        calculateNetIncome() {
            if (this.validateIncomeFields()) {
                if (!this.isLoaded) 
                    this.income.id = this.getIncomeID();
                this.income.salary = this.toFixedNumber(this.income.type === 'h' ? (this.regularPay + this.overTimePay) : parseFloat(this.salary), 2);
                const preTaxDeductedIncome = this.income.salary - (this.preTaxDeductionTotal * this.income.payPeriod);
                this.setFederalTaxRate(preTaxDeductedIncome);
                this.setStateTaxRate(preTaxDeductedIncome);
                this.netIncome = preTaxDeductedIncome - (this.postTaxDeductionTotal * this.income.payPeriod) - (preTaxDeductedIncome * (this.stateTaxRate / 100) + ((preTaxDeductedIncome) * (this.federalTaxRate / 100)) + this.getFICATaxAmount(preTaxDeductedIncome));
                this.income.netSalary = this.toFixedNumber(this.netIncome, 2);
                if(this.netIncome > 0)
                    this.toggleShowConfirmModal();
            }
        },
        saveIncome() {
            this.$store.dispatch('createIncome', this.income).then(() => {
                this.$router.push('/income');
            });
        },
        updateIncome() {
            this.$store.dispatch('updateIncome', this.income).then(() => {
                this.$router.push('/income');
            });
        },
        loadIncome(id) {
            const incomeId = typeof id !== 'number' ? parseInt(id) : id;
            this.$store.dispatch('getIncomeById', incomeId).then(() => {
                if (this.$store.state.editedIncome === null) {
                    console.log(`No income found for id '${id}'`);
                    this.$router.push('/income');
                } else {
                    const i = this.$store.state.editedIncome;
                    this.income = {
                        id: i.id,
                        name: i.name,
                        type: i.type,
                        salary: i.salary,
                        netSalary: i.netSalary,
                        hourlyRate: i.hourlyRate,
                        hoursPerWeek: i.hoursPerWeek,
                        employmentType: i.employmentType,
                        filingStatus: i.filingStatus,
                        payPeriod: i.payPeriod,
                        state: i.state,
                        isActive: i.isActive,
                        isTaxExempt: i.isTaxExempt,
                        deductions: i.deductions.map(d => { return d; })
                    };
                    this.salary = this.income.salary;
                    this.toggleIsLoaded();
                }
            }).catch(x => {
                this.errMessage = x.message;
            });
        },
        cancelIncome() {
            this.$router.push('/income');
        },
        setFederalTaxRate(preTaxDeductedIncome){
            if (this.income.isTaxExempt) {
                this.federalTaxRate = 0;
                this.federalTaxAmount = 0;
                return;
            }
            const federal = this.federalTaxes.filter(ft => {
                return ft.filing_status === this.income.filingStatus && ft.incomeMin < preTaxDeductedIncome && ft.incomeMax > preTaxDeductedIncome;
            });
            if(federal && federal.length > 0) {
                this.federalTaxRate = parseFloat(federal[0].rate);
            }
            const fedTaxRatePct = this.federalTaxRate / 100;
            this.federalTaxAmount = this.toFixedNumber(preTaxDeductedIncome * fedTaxRatePct, 2);
        },
        setStateTaxRate(preTaxDeductedIncome) {
            if (this.income.isTaxExempt) {
                this.stateTaxRate = 0;
                this.stateTaxAmount = 0;
                return;
            }
            const state = this.stateTaxes.filter(s => {
                return s.filing_status === this.selectedStateFilingStatus && s.incomeMin < preTaxDeductedIncome && s.state === this.income.state;
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
        getFICATaxAmount(preTaxDeductedIncome) {
            let amount = 0;
            if (this.income.isTaxExempt) {
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
            let i = this.income;
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
            this.income.isTaxExempt = !this.income.isTaxExempt;
            this.income.filingStatus = this.income.isTaxExempt ? null : this.income.filingStatus;
            this.income.state = this.income.isTaxExempt ? null : this.income.state;
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
            this.income.isActive = !this.income.isActive;
        },
        removeDeduction(deduction) {
            const index = this.income.deductions.findIndex(d => d.name === deduction.name && d.type === deduction.type && d.amount === deduction.amount);
            if (index > -1) {
                this.income.deductions.splice(index, 1);
            }
        },
        getIncomeID(existingIds = this.$store.state.income.map(i => i.id)) {
            let isUniqueId = false;
            let max = 9999999;
            let maxRetries = 1000;
            let count = 0;
            let id = Math.floor(Math.random() * Math.floor(max));
            console.log({'newId': id,'currentIncomeIds':existingIds});
            while (!isUniqueId) {
                isUniqueId = existingIds.find(bill => bill.id === id) === undefined;
                if (!isUniqueId) {
                    id = Math.floor(Math.random() * Math.floor(max));
                }
                count++;
                if(count >= maxRetries) {
                    isUniqueId = true;
                    id = -1;
                }
            }
            return id;
        },
        toFixedNumber(num, digits, base){
            var pow = Math.pow(base||10, digits);
            return Math.round(num*pow) / pow;
        }
    }
}
</script>
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