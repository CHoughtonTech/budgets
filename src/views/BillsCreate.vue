<template>
    <div class="bills-create-view">
        <h1>Add Bill</h1>
        <label for="billName">Name</label>
        <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
        <input id="billName" type="text" ref="billName" v-model="bill.name" placeholder="Bill Name" :class="{'error-detail-input': validationFailed('billName')}" />
        <label for="billAmount">Amount</label>
        <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
        <input id="billAmount" type="number" v-model="bill.amount" placeholder="0.00" :class="{'error-detail-input': validationFailed('billAmount')}" />
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
        <button type="button" @click="createBill()">Create</button>
        <button type="button" @click="cancelBill()">Cancel</button>
        <BaseModal v-if="showCreateAnotherModal">
            <h3 slot="header" style="color:lightgrey;">Bill Creation</h3>
            <h6 slot="body" style="color:lightgrey;">Create Another bill?</h6>
            <div slot="footer">
                <button @click="createAnotherConfirm('Yes')">Yes</button>
                <button @click="createAnotherConfirm('No')">No</button>
            </div>
        </BaseModal>
    </div>
</template>
<script>
import BaseModal from '../components/BaseModal';
export default {
    components: {
        BaseModal: BaseModal
    },
    created() {
        if (this.$store.state.categories?.length <= 0) {
            this.$router.push("/bills");
        }
    },
    computed: {
        activeSubCategories() {
            return this.$store.getters.getSubCategoriesByCategoryId(this.selectedCategoryId);
        }
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
                subCategoryId : null
            },
            showCreateAnotherModal: false,
            selectedCategoryId: null,
            selectedSubCategoryId: null,
            errors: []
        }
    },
    methods: {
        createBill() {
            if (this.validateFields()) {
                this.bill.id = this.getBillID();
                this.bill.amount = this.toFixedNumber(parseFloat(this.bill.amount), 2);
                this.bill.dateCreated = new Date().toLocaleDateString();
                this.$store.dispatch("createBill", this.bill).then(() => {
                    this.showCreateAnotherModal = true;
                });
            }
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
                console.log("Create another");
                this.bill = this.resetBill();
                this.$refs.billName.focus();
                this.showCreateAnotherModal = false;
            } else {
                console.log("Nope, back to bills");
                this.$router.push('/bills');
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
.bills-create-view {
    min-width: 500px;
    width: 25%;
}
</style>