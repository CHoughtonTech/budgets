<script>
import BaseModal from '../components/BaseModal';
import DatePicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';
import { defineComponent, watch } from 'vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { guid } from '@/mixins/GlobalMixin';

export default defineComponent({
    components: {
        BaseModal,
        DatePicker
    },
    mixins: [guid],
    props: {
        billId: null
    },
    created() {
        if (this.categories.length <= 0) {
            this.$router.push('/bills');
        }
        if (this.billId) {
            this.loadBill(this.billId);
        }
    },
    mounted() {
        watch(
            () => this.bill.isRecurring,
            (currentValue, oldValue) => {
                if (currentValue === false && oldValue === true) {
                    this.bill.recurringCycle = null;
                    this.selectedRecurringCycle = null;
                }
            }
        )
    },
    computed: {
        ...mapState(mainStore, ['getUserId', 'categories', 'subCategories', 'getSubCategoriesByCategoryId', 'bills']),
        activeSubCategories() {
            return this.getSubCategoriesByCategoryId(this.selectedCategoryId);
        },
        buttonLabel() {
            return this.isLoaded ? 'Update' : 'Create';
        },
        showCreateAnotherModal() {
            return !this.isLoaded && this.showConfirmModal;
        },
        showUpdateModal() {
            return this.isLoaded && this.showConfirmModal;
        },
        billActionLabel() {
            return this.isLoaded ? 'Edit Bill' : 'Add Bill';
        },
    },
    data() {
        return {
            bill: {
                userId: null,
                id: null,
                name: null,
                paid: false,
                amount: null,
                datePaid: null,
                dateCreated: null,
                isRecurring: false,
                paidCount: 0,
                isFixedAmount: false,
                datePaidOff: null,
                subCategoryId : null,
                dueDate: null,
                recurringCycle: null,
            },
            format: 'M/d/yyyy',
            selectedCategoryId: null,
            selectedSubCategoryId: null,
            selectedDueDate: null,
            selectedRecurringCycle: null,
            isLoaded: false,
            showConfirmModal: false,
            recurringCycles: [
                { label: 'Monthly', value: 1 },
                { label: 'Quarterly', value: 3 },
                { label: 'Semi-Annual', value: 6 },
                { label: 'Annual', value: 12 }
            ],
            errors: []
        }
    },
    methods: {
        ...mapActions(mainStore, ['getBillById', 'updateBill', 'createBill']),
        setRecurringCycle() {
            if (!this.bill.isRecurring || this.bill.isRecurring === false) return;
            this.bill.recurringCycle = {
                interval: this.selectedRecurringCycle,
                date: this.selectedDueDate.toLocaleDateString()
            }
        },
        loadBill(id) {
            this.getBillById(id)
                .then((b) => {
                    this.bill = JSON.parse(JSON.stringify(b));
                    this.selectedSubCategoryId = this.bill.subCategoryId;
                    this.selectedDueDate = new Date(this.bill.dueDate);
                    this.selectedRecurringCycle = this.bill.recurringCycle?.interval;
                    this.setCategoryId();
                    this.isLoaded = true;
                })
                .catch((err) => {
                    console.log(err.message);
                    this.$router.push('/bills');
                });
        },
        createUserBill() {
            if (this.validateFields()) {
                this.bill.id = this.generateGUID();
                this.bill.userId = this.getUserId;
                this.bill.amount = this.toFixedNumber(parseFloat(this.bill.amount), 2);
                this.bill.dateCreated = new Date().toLocaleDateString();
                this.bill.dueDate = this.selectedDueDate.toLocaleDateString();
                this.setRecurringCycle();
                this.createBill(this.bill).then(() => {
                    this.toggleShowConfirmModal();
                });
            }
        },
        updateUserBill() {
            if (this.validateFields()) {
                if (!this.bill.userId)
                    this.bill.userId = this.getUserId;
                this.bill.amount = this.toFixedNumber(parseFloat(this.bill.amount), 2);
                this.bill.dueDate = this.selectedDueDate.toLocaleDateString();
                this.setRecurringCycle();
                this.toggleShowConfirmModal();
            }
        },
        updateBillConfirm() {
            this.toggleShowConfirmModal();
            this.updateBill(this.bill).then(() => this.$router.push('/bills'));
        },
        cancelBill() {
            this.resetBill();
            this.$router.push('/bills');
        },
        toggleShowConfirmModal() {
            this.showConfirmModal = !this.showConfirmModal;
        },
        validateFields() {
            this.errors = [];
            let b = this.bill;
            //Bill Name Validation
            if (!b.name || b.name === null) {
                this.errors.push({ message: 'Name is required', field: 'billName' });
            }
            //Bill Amount Validation
            if (!b.amount || b.amount === null) {
                this.errors.push({ message: 'Amount is required', field: 'billAmount' });
            }
            //Bill Due Date
            if (!this.selectedDueDate || this.selectedDueDate === null) {
                this.errors.push({ message: 'Due Date is required', field: 'billDueDate' })
            }
            //Bill Subcategory
            if (!b.subCategoryId || b.subCategoryId === null) {
                this.errors.push({ message: 'Subcategory is required', field: 'billSubcategories' });
            }
            //Bill Recurring Cycle
            if (b.isRecurring && b.recurringCycle === null) {
                this.errors.push({ message: 'Recurring Cycle is required if bill is set to reoccur.', field: 'billRecurringCycle' })
            }
            return this.errors.length <= 0;
        },
        validationFailed(field) {
            let found = this.errors.find(err => err.field === field) !== undefined;
            return found;
        },
        getErrorMessage(field) {
            if (this.errors.length <= 0) {
                return null;
            } else {
                let found = this.errors.find(err => err.field === field);
                if (found && found !== null) {
                    return `*${found.message}`;
                } else {
                    return `No errors for '${field}'`
                }
            }
        },
        setSubcategoryId() {
            if (this.selectedSubCategoryId !== null) {
                this.bill.subCategoryId = this.selectedSubCategoryId;
            }
        },
        resetSubcategoryId() {
            let found = this.activeSubCategories.find(sub => sub.id === this.selectedSubCategoryId);
            if (!found) {
                this.selectedSubCategoryId = null;
                this.bill.subCategoryId = null;
            }
        },
        resetBill() {
            this.selectedCategoryId =  null;
            this.selectedSubCategoryId = null;
            this.selectedDueDate = null;
            this.selectedRecurringCycle = null;
            return {
                id: null,
                name: null,
                paid: false,
                amount:null,
                datePaid: '',
                dateCreated: null,
                isRecurring: false,
                paidCount: 0,
                isFixedAmount: false,
                datePaidOff: '',
                subCategoryId : null,
                dueDate: null,
                recurringCycle: null,
            };
        },
        createAnotherConfirm(value) {
            if (value === 'Yes') {
                this.bill = this.resetBill();
                this.$refs.billName.focus();
                this.toggleShowConfirmModal();
            } else {
                this.$router.push('/bills');
            }
        },
        setCategoryId() {
            let found = this.subCategories.find(sc => sc.id === this.selectedSubCategoryId);
            if(found) {
                let foundCategory = this.categories.find(c => c.id === found.CategoryId);
                if (foundCategory) {
                    this.selectedCategoryId = foundCategory.id;
                }
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
    <div
        :class="$style['page-layout']"
    >
        <h1>{{ billActionLabel }}</h1>
        <label for="billName">Name</label>
        <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
        <input id="billName" type="text" ref="billName" v-model="bill.name" placeholder="Bill Name" :class="{'error-detail-input': validationFailed('billName')}" />
        <label for="billAmount">Amount</label>
        <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
        <input id="billAmount" type="number" v-model="bill.amount" placeholder="0.00" :class="{'error-detail-input': validationFailed('billAmount')}" />
        <label for="billDueDate">Due Date</label>
        <div v-if="validationFailed('billDueDate')" class="error-detail">{{getErrorMessage('billDueDate')}}</div>
        <DatePicker
            :class="[
                $style['date-picker'],
                validationFailed('billDueDate') && $style['error-detail-input']
            ]"
            v-model="selectedDueDate"
            :format="format"
            :enableTimePicker="false"
            :autoApply="true"
        />
        <div>
            <label for="billFixedAmount" style="margin-right: 25px">Is fixed amount?</label>
            <input id="billFixedAmount" type="checkbox" v-model="bill.isFixedAmount" />
        </div>
        <div>
            <label for="billRecurring" style="margin-right: 25px">Is recurring?</label>
            <input id="billRecurring" type="checkbox" v-model="bill.isRecurring" />
        </div>
        <label for="billRecurringCycle" v-if="bill.isRecurring">Recurring Cycle</label>
        <div v-if="validationFailed('billRecurringCycle')" class="error-detail">{{getErrorMessage('billRecurringCycle')}}</div>
        <select id="billRecurringCycle" v-if="bill.isRecurring" v-model="selectedRecurringCycle" @change="setRecurringCycle" :disabled="!selectedDueDate">
            <option :value="null" hidden selected>Recurring Cycle</option>
            <option v-for="option in recurringCycles" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <label for="billCategories">Categories</label>
        <div v-if="validationFailed('billSubcategories') && selectedCategoryId === null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
        <select id="billCategories" v-model="selectedCategoryId" @change="resetSubcategoryId" :class="{'error-detail-input': validationFailed('billSubcategories') && selectedCategoryId === null}">
            <option :value="null" hidden selected>Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
                {{category.Name}}
            </option>
        </select>
        <label v-if="activeSubCategories.length > 0" for="billSubcategories">SubCategories</label>
        <div v-if="validationFailed('billSubcategories') && selectedCategoryId !== null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
        <select id="billSubcategories" v-if="activeSubCategories.length > 0" v-model="selectedSubCategoryId" @blur="setSubcategoryId" :class="{'error-detail-input': validationFailed('billSubcategories')}">
            <option :value="null" hidden selected>Subcategory</option>
            <option v-for="subcategory in activeSubCategories" :key="subcategory.id" :value="subcategory.id">
                {{subcategory.Name}}
            </option>
        </select>
        <div :class="$style['button-group']">
            <button type="button" @click="isLoaded ? updateUserBill() : createUserBill()">{{ buttonLabel }}</button>
            <button type="button" @click="cancelBill()">Cancel</button>
        </div>
        <BaseModal v-if="showCreateAnotherModal">
            <template #header>
                <h3>Bill Creation</h3>
            </template>
            <template #body>
                <h4>Create Another bill?</h4>
            </template>
            <template #footer>
                <button @click="createAnotherConfirm('Yes')">Yes</button>
                <button @click="createAnotherConfirm('No')">No</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showUpdateModal">
            <template #header>
                <h3>Confirm Update</h3>
            </template>
            <template #body>
                <div>Update <strong><i>{{ bill.name }}</i></strong>?</div>
            </template>
            <template #footer>
                <button type="button" @click="updateBillConfirm()">Confirm</button>
                <button type="button" @click="toggleShowConfirmModal()">Cancel</button>
            </template>
        </BaseModal>
    </div>
</template>
<style lang="scss" module>
.page-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.date-picker {
    --dp-icon-color: #{$purple};
    &.error-detail-input {
        --dp-background-color: #{$error-bg-color-light};
        --dp-border-color: #{$error-bg-color};
        border: 2px solid $error-bg-color;
    }
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