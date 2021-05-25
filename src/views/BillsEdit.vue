<template>
    <div class="bills-edit-view">
        <h3>Edit Bill</h3>
        <div v-if="!this.$store.state.editedBill">
            <button class="button is-info is-loading" style="width:100%;"></button>
        </div>
        <div v-else>
            <h1>{{this.updatedBill.name}}</h1>
            <hr/>
            <label for="billName">Name</label>
            <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
            <input id="billName" type="text" v-model="updatedBill.name" :class="{'error-detail-input' : validationFailed('billName')}"/>
            <label for="billAmount">Amount</label>
            <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
            <input id="billAmount" type="number" v-model="updatedBill.amount" :class="{'error-detail-input' : validationFailed('billAmount')}"/>
            <label for="billDueDate">Due Date</label>
            <datepicker placeholder="Select Due Date" :format="format" :disabledDates="disabledDates" v-model="selectedDueDate"></datepicker>
            <label for="billFixedAmount" style="margin-right: 25px">Is Fixed Amount</label>
            <input id="billFixedAmount" type="checkbox" v-model="updatedBill.isFixedAmount"/><br/>
            <label for="billRecurring" style="margin-right: 25px">Is Recurring</label>
            <input id="billRecurring" type="checkbox" v-model="updatedBill.isRecurring"/><br/>
            <label for="billCategories">Categories</label>
            <div v-if="validationFailed('billSubcategories') && this.selectedCategoryId === null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
            <select id="billCategories" v-model="selectedCategoryId" @change="resetSubcategoryId" :class="{'error-detail-input': validationFailed('billSubcategories') && this.selectedCategoryId === null}">
                <option v-for="category in this.$store.state.categories" :key="category.id" :value="category.id">
                    {{category.Name}}
                </option>
            </select>
            <label v-if="activeSubCategories.length > 0" for="billSubCategories">SubCategories</label>
            <div v-if="validationFailed('billSubcategories') && this.selectedCategoryId !== null" class="error-detail">{{getErrorMessage('billSubcategories')}}</div>
            <select id="billSubCategories" v-if="activeSubCategories.length > 0" v-model="selectedSubCategoryId" :class="{'error-detail-input': validationFailed('billSubcategories') && this.selectedSubCategoryId === null}">
                <option v-for="subCategory in this.activeSubCategories" :key="subCategory.id" :value="subCategory.id">
                    {{subCategory.Name}}
                </option>
            </select>
            <button type="button" @click="updateBill()">Update</button>
            <button type="button" @click="cancelUpdateBill()">Cancel</button>
            <BaseModal v-if="showConfirmModal">
                <h3 slot="header" style="color:lightgrey;">Confirm Update</h3>
                <div slot="body" style="color:lightgrey;">Update <strong><i style="color:white;">{{updatedBill.name}}</i></strong>?</div>
                <div slot="footer">
                    <button type="button" @click="updateBillConfirm()">Confirm</button>
                    <button type="button" @click="showConfirmModal = !showConfirmModal">Cancel</button>
                </div>
            </BaseModal>
        </div>
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
    data() {
        return {
            updatedBill: Object,
            selectedCategoryId: null,
            selectedSubCategoryId: null,
            showConfirmModal: false,
            isLoading: false,
            format: 'M/d/yyyy',
            selectedDueDate: null,
            disabledDates: {
                to: new Date(new Date().getFullYear(),new Date().getMonth(),1)
            },
            errors: []
        }
    },
    computed: {
        activeSubCategories() {
            return this.$store.getters.getSubCategoriesByCategoryId(this.selectedCategoryId);
        }
    },
    created() {
        this.isLoading = true;
        this.$store.dispatch('getBillById', this.id).then(() => {
            if (this.$store.state.editedBill === null) {
                console.log(`No bill found for id '${this.id}'`);
                this.$router.push('/bills');
            } else {
                this.loadBill(this.$store.state.editedBill);
                this.selectedSubCategoryId = this.updatedBill.subCategoryId;
                this.selectedDueDate = this.updatedBill.dueDate;
                this.setCategoryId();
            }
            this.isLoading = false;
        }).catch(() => {            
            console.log(`No bill found for id '${this.id}'`);
            this.$router.push('/bills');
        });
    },
    methods: {
        loadBill(foundBill) {
            this.updatedBill = {
                id: foundBill.id,
                name: foundBill.name,
                paid: foundBill.paid,
                amount: parseFloat(foundBill.amount),
                datePaid: foundBill.datePaid,
                dateCreated: foundBill.dateCreated,
                isRecurring: foundBill.isRecurring,
                paidCount: foundBill.paidCount,
                isFixedAmount: foundBill.isFixedAmount,
                datePaidOff: foundBill.datePaidOff,
                subCategoryId : foundBill.subCategoryId,
                dueDate: foundBill.dueDate
            }
        },
        updateBill() {
            this.updatedBill.subCategoryId = this.selectedSubCategoryId;
            if (this.selectedDueDate && this.selectedDueDate !== null && typeof this.selectedDueDate !== "string") {
                this.updatedBill.dueDate = this.selectedDueDate.toLocaleDateString();
            } else {
                this.updatedBill.dueDate = this.selectedDueDate;
            }
            if (this.validateFields()) {
                this.showConfirmModal = true;
            }
        },
        updateBillConfirm() {
            this.showConfirmModal = false;
            if (this.validateFields()) {
                this.$store.dispatch('updateBill', this.updatedBill).then(() => {
                    this.$router.push('/bills');
                });
            } else {
                console.log("Validation Failed");
            }
        },
        cancelUpdateBill() {
            this.$router.push('/bills');
        },
        resetSubcategoryId() {
            let found = this.activeSubCategories.find(sub => sub.id === this.selectedSubCategoryId);
            if (!found) {
                this.selectedSubCategoryId = null;
                this.updatedBill.subCategoryId = null;
            }
        },
        validateFields() {
            this.errors = [];
            let b = this.updatedBill;
            //Bill Name Validation
            if (!b.name || b.name === null) {
                this.errors.push({ message: "Name is required", field: "billName" });
            }
            //Bill Amount Validation
            if (!b.amount || b.amount === null) {
                this.errors.push({ message: "Amount is required", field: "billAmount" });
            }
            //Bill Subcategory
            if (!b.subCategoryId || b.subCategoryId === null || b.subCategoryId === 0) {
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
        setCategoryId() {
            let found = this.$store.state.subCategories.find(sc => sc.id === this.selectedSubCategoryId);
            if(found) {
                let foundCategory = this.$store.state.categories.find(c => c.id === found.CategoryId);
                if (foundCategory) {
                    this.selectedCategoryId = foundCategory.id;
                }
            }
        }
    }
}
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
.bills-edit-view {
    min-width: 500px;
    width: 25%;
}
</style>