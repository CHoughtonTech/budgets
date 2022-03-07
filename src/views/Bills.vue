<template>
    <div class="bills-create-view">
        <h1>{{ billActionLabel }}</h1>
        <label for="billName">Name</label>
        <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
        <input id="billName" type="text" ref="billName" v-model="bill.name" placeholder="Bill Name" :class="{'error-detail-input': validationFailed('billName')}" />
        <label for="billAmount">Amount</label>
        <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
        <input id="billAmount" type="number" v-model="bill.amount" placeholder="0.00" :class="{'error-detail-input': validationFailed('billAmount')}" />
        <label for="billDueDate">Due Date</label>
        <datepicker placeholder="Select Due Date" :format="format" :disabledDates="disabledDates" v-model="selectedDueDate"></datepicker>
        <label for="billFixedAmount" style="margin-right: 25px">Is fixed amount?</label>
        <input id="billFixedAmount" type="checkbox" v-model="bill.isFixedAmount" /><br/>
        <label for="billRecurring" style="margin-right: 25px">Is recurring?</label>
        <input id="billRecurring" type="checkbox" v-model="bill.isRecurring" /><br/>
        <label for="billCategories">Categories</label>
        <div v-if="validationFailed('billSubcategories') && this.selectedCategoryId === null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
        <select id="billCategories" v-model="selectedCategoryId" @change="resetSubcategoryId" :class="{'error-detail-input': validationFailed('billSubcategories') && this.selectedCategoryId === null}">
            <option v-for="category in this.$store.state.categories" :key="category.id" :value="category.id">
                {{category.Name}}
            </option>
        </select>
        <label v-if="activeSubCategories.length > 0" for="billSubcategories">SubCategories</label>
        <div v-if="validationFailed('billSubcategories') && this.selectedCategoryId !== null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
        <select id="billSubcategories" v-if="activeSubCategories.length > 0" v-model="selectedSubCategoryId" @blur="setSubcategoryId" :class="{'error-detail-input': validationFailed('billSubcategories')}">
            <option v-for="subcategory in activeSubCategories" :key="subcategory.id" :value="subcategory.id">
                {{subcategory.Name}}
            </option>
        </select>
        <button type="button" @click="isLoaded ? updateBill() : createBill()">{{ buttonLabel }}</button>
        <button type="button" @click="cancelBill()">Cancel</button>
        <BaseModal v-if="showCreateAnotherModal">
            <h3 slot="header" style="color:lightgrey;">Bill Creation</h3>
            <h6 slot="body" style="color:lightgrey;">Create Another bill?</h6>
            <div slot="footer">
                <button @click="createAnotherConfirm('Yes')">Yes</button>
                <button @click="createAnotherConfirm('No')">No</button>
            </div>
        </BaseModal>
        <BaseModal v-if="showUpdateModal">
            <h3 slot="header" style="color:lightgrey;">Confirm Update</h3>
            <div slot="body" style="color:lightgrey;">Update <strong><i style="color:white;">{{ bill.name }}</i></strong>?</div>
            <div slot="footer">
                <button type="button" @click="updateBillConfirm()">Confirm</button>
                <button type="button" @click="toggleShowConfirmModal()">Cancel</button>
            </div>
        </BaseModal>
    </div>
</template>
<script>
import BaseModal from '../components/BaseModal';
import Datepicker from 'vuejs-datepicker';
export default {
    components: {
        BaseModal: BaseModal,
        Datepicker: Datepicker
    },
    props: {
        id: null
    },
    created() {
        if (this.$store.state.categories?.length <= 0) {
            this.$router.push("/bills");
        }
        if (this.id !== null && this.id !== -1) {
            this.loadBill(this.id);
        }
    },
    computed: {
        activeSubCategories() {
            return this.$store.getters.getSubCategoriesByCategoryId(this.selectedCategoryId);
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
                id: null,
                name: null,
                paid: false,
                amount:0.0,
                datePaid: null,
                dateCreated: null,
                isRecurring: false,
                paidCount: 0,
                isFixedAmount: false,
                datePaidOff: null,
                subCategoryId : null,
                dueDate: null
            },
            format: 'M/d/yyyy',
            selectedCategoryId: null,
            selectedSubCategoryId: null,
            selectedDueDate: null,
            isLoaded: false,
            showConfirmModal: false,
            disabledDates: {
                to: new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())
            },
            errors: []
        }
    },
    methods: {
        loadBill(id) {
            const billId = typeof id !== 'number' ? parseInt(id) : id;
            this.$store.dispatch('getBillById', billId).then(() => {
                const b = this.$store.state.editedBill;
                if (b.id !== billId) {
                    console.log(`No bill found for id '${billId}'`);
                    this.$router.push('/bills');
                } else {
                    this.bill = {
                        id: b.id,
                        name: b.name,
                        paid:  b.paid,
                        amount: b.amount,
                        datePaid:  b.datePaid,
                        dateCreated:  b.dateCreated,
                        isRecurring:  b.isRecurring,
                        paidCount:  b.paidCount,
                        isFixedAmount: b.isFixedAmount,
                        datePaidOff: b.datePaidOff,
                        subCategoryId: b.subCategoryId,
                        dueDate: b.dueDate
                    };
                    this.selectedSubCategoryId = this.bill.subCategoryId;
                    this.selectedDueDate = new Date(this.bill.dueDate);
                    this.setCategoryId();
                    this.isLoaded = true;
                }
            }).catch(() => {            
                console.log(`No bill found for id '${this.id}'`);
                this.$router.push('/bills');
            });
        },
        createBill() {
            if (this.validateFields()) {
                this.bill.id = this.getBillID();
                this.bill.amount = this.toFixedNumber(parseFloat(this.bill.amount), 2);
                this.bill.dateCreated = new Date().toLocaleDateString();
                this.bill.dueDate = this.selectedDueDate.toLocaleDateString();
                this.$store.dispatch("createBill", this.bill).then(() => {
                    this.toggleShowConfirmModal();
                });
            }
        },
        updateBill() {
            if (this.validateFields()) {
                this.toggleShowConfirmModal();
            }
        },
        updateBillConfirm() {
            this.toggleShowConfirmModal();
            this.$store.dispatch('updateBill', this.bill).then(() => {
                this.$router.push('/bills');
            });
        },
        cancelBill() {
            this.resetBill();
            this.$router.push('/bills');
        },
        getBillID() {
            let isUniqueId = false;
            let max = 9999999;
            let maxRetries = 1000;
            let count = 0;
            let id = Math.floor(Math.random() * Math.floor(max));
            while (!isUniqueId) {
                isUniqueId = this.$store.state.bills.find(bill => bill.id === id) === undefined;
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
        toggleShowConfirmModal() {
            this.showConfirmModal = !this.showConfirmModal;
        },
        validateFields() {
            this.errors = [];
            let b = this.bill;
            //Bill Name Validation
            if (!b.name || b.name === null) {
                this.errors.push({ message: "Name is required", field: "billName" });
            }
            //Bill Amount Validation
            if (!b.amount || b.amount === null) {
                this.errors.push({ message: "Amount is required", field: "billAmount" });
            }
            //Bill Subcategory
            if (!b.subCategoryId || b.subCategoryId === null) {
                this.errors.push({ message: "Subcategory is required", field: "billSubcategories" });
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
                subCategoryId : null
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
            let found = this.$store.state.subCategories.find(sc => sc.id === this.selectedSubCategoryId);
            if(found) {
                let foundCategory = this.$store.state.categories.find(c => c.id === found.CategoryId);
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
};
</script>
<style>
h1 {
    color: #C15EF2
}
h3 {
    color: lightgrey;
}
label {
    color: lightgrey;
}
.bills-create-view {
    min-width: 500px;
    width: 25%;
}
</style>