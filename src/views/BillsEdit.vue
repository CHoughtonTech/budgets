<template>
    <div>
        <h1>Edit Bill</h1>
        <div>{{this.updatedBill.name}}</div>
        <hr/>
        <label for="billName">Name</label>
        <div v-if="validationFailed('billName')" class="error-detail">{{getErrorMessage('billName')}}</div>
        <input id="billName" type="text" v-model="updatedBill.name" :class="{'error-detail-input' : validationFailed('billName')}"/>
        <label for="billAmount">Amount</label>
        <div v-if="validationFailed('billAmount')" class="error-detail">{{getErrorMessage('billAmount')}}</div>
        <input id="billAmount" type="number" v-model="updatedBill.amount" :class="{'error-detail-input' : validationFailed('billAmount')}"/>
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
            <h3 slot="header" style="color:Teal;">Confirm Update</h3>
            <div slot="body">Update <strong><i>{{updatedBill.name}}</i></strong>?</div>
            <div slot="footer">
                <button type="button" @click="updateBillConfirm()">Confirm</button>
                <button type="button" @click="showConfirmModal = !showConfirmModal">Cancel</button>
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
    props: {
        id: null
    },
    data() {
        return {
            updatedBill: Object,
            selectedCategoryId: null,
            selectedSubCategoryId: null,
            showConfirmModal: false,
            errors: []
        }
    },
    computed: {
        activeSubCategories() {
            return this.$store.getters.getSubCategoriesByCategoryId(this.selectedCategoryId);
        }
    },
    created() {
        this.$store.dispatch('getBillById', this.id).then(() => {
            if (this.$store.state.editedBill === null) {
                console.log(`No bill found for id '${this.id}'`);
                this.$router.push('/bills');
            } else {
                this.updatedBill = this.$store.state.editedBill;
                this.selectedSubCategoryId = this.updatedBill.subCategoryId;
                this.setCategoryId();
            }
        }).catch(() => {            
            console.log(`No bill found for id '${this.id}'`);
            this.$router.push('/bills');
        });
    },
    methods: {
        updateBill() {
            this.updatedBill.subCategoryId = this.selectedSubCategoryId;
            if (this.validateFields()) {
                this.showConfirmModal = true;
            }
        },
        updateBillConfirm() {
            this.showConfirmModal = false;
            if (this.validateFields()) {
                this.$store.dispatch('updateBill', this.updatedBill).then(() => {
                    this.$store.dispatch("getAllBills").then(() => {
                        this.$router.push('/bills');
                    });
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