<template>
    <div>
        <h3>{{activeMonth + ' ' + new Date().getFullYear() }} Bills</h3>
        <router-link class="add-bill" :to="{ name: 'create-bill' }"><BaseIcon name="plus-circle">Add a Bill</BaseIcon></router-link>
        <hr/>
        <BaseIcon v-if="unpaidBills.length > 0" name="arrow-right-circle"><span slot="pre">Unpaid Bills<span class="badge -fill-gradient">{{unpaidBills.length}}</span></span></BaseIcon>
        <BillCard v-for="bill in unpaidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" />
        <BaseIcon v-if="paidBills.length > 0" name="arrow-right-circle"><span slot="pre">Paid Bills</span></BaseIcon>
        <BillCard v-for="bill in paidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" />
        <BaseModal v-if="showBillDeleteModal">
            <h3 slot="header" style="color:Teal;">Delete Bill</h3>
            <div slot="body">
                Delete bill: <b style="color:Teal;">{{this.selectedBill.name}}</b>?
            </div>
            <div slot="footer">
                <button @click="deleteBillConfirm('confirm')">Confirm</button>
                <button @click="deleteBillConfirm('cancel')">Cancel</button>
            </div>
        </BaseModal>
        <BaseModal v-if="showBillAmountModal">
            <h3 slot="header" style="color:Teal;">Enter Amount</h3>
            <div slot="body">
                <h4>Bill: {{selectedBill.name}}</h4>
                <label for="billInputAmount">Amount</label>
                <div v-if="validationFailed('billInputAmount')" class="error-detail">{{getErrorMessage('billInputAmount')}}</div>
                <input type="number" v-model="selectedBill.amount" :class="{'error-detail-input': validationFailed('billInputAmount')}" />
            </div>
            <div slot="footer">
                <button @click="updateBillPaidConfirm('confirm')">Confirm</button>
                <button @click="updateBillPaidConfirm('cancel')">Cancel</button>
            </div>
        </BaseModal>
        <BaseModal v-if="showBillDetailModal">
            <h4 slot="header" style="color:Teal;">{{selectedBill.name}}</h4>
            <div slot="body">
                <hr/><br/>
                <div class="bill-detail"><span class="bill-detail-label">Amount</span>{{selectedBill.amount | currency}}</div>
                <div class="bill-detail"><span class="bill-detail-label">Created</span>{{selectedBill.dateCreated}}</div>
                <div class="bill-detail"><span class="bill-detail-label">Recurring</span><BaseIcon :name="selectedBill.isRecurring ? 'check' : 'x'"></BaseIcon></div>
                <div class="bill-detail"><span class="bill-detail-label">Fixed Amount</span><BaseIcon :name="selectedBill.isFixedAmount ? 'check' : 'x'"></BaseIcon></div>
                <div class="bill-detail"><span class="bill-detail-label">Category</span>{{selectedCategory}}</div>
                <div class="bill-detail"><span class="bill-detail-label">SubCategory</span>{{selectedSubCategory}}</div>
                <div class="bill-detail"><span class="bill-detail-label">Paid</span><i><strong>{{selectedBill.paidCount}}</strong></i> time{{selectedBill.paidCount === 1 ? '' : 's'}}</div>
            </div>
            <div slot="footer">
                <button style="float:right;" @click="showBillDetailModal = false">Ok</button>
                <br/><br/>
            </div>
        </BaseModal>
    </div>
</template>

<script>
import BillCard from "../components/BillCard";
import BaseModal from "../components/BaseModal";
import BaseIcon from "../components/BaseIcon";
export default {
    components: {
        BillCard: BillCard,
        BaseModal: BaseModal,
        BaseIcon: BaseIcon
    },
    data() {
        return {
            selectedBill: Object,
            showBillDeleteModal: false,
            showBillDetailModal: false,
            showBillAmountModal: false,
            errors: []
        }
    },
    computed: {
        paidBills() {
            return this.$store.getters.paidBills;
        },
        unpaidBills() {
            return this.$store.getters.unpaidBills;
        },
        activeMonth() {
            if (this.$store.state.activeMonth && this.$store.state.activeMonth !== null) {
                return this.$store.state.activeMonth.name;
            }
            return "";
        },
        selectedCategory() {
            return this.$store.getters.getCategoryNameById(this.selectedBill?.subCategoryId);
        },
        selectedSubCategory() {
            return this.$store.getters.getSubCategoryNameById(this.selectedBill?.subCategoryId);
        }
    },
    methods: {
        deleteBill(bill) {
            this.selectedBill = bill;
            this.showBillDeleteModal = true;
        },
        updateBillPaid(bill) {
            this.selectedBill = bill;
            if (this.selectedBill.isFixedAmount === false && this.selectedBill.isRecurring === true) {
                this.showBillAmountModal = true;
            } else {
                bill.paid = true;
                bill.datePaid = new Date().toLocaleDateString();
                bill.paidCount++;
                this.$store.dispatch('updateBill', bill);
            }
        },
        updateBillPaidConfirm(choice) {
            let validationPassed = this.validateAmount();
            if (choice === 'cancel') {
                this.showBillAmountModal = !this.showBillAmountModal;
            } else {
                if (validationPassed === true) {
                    this.selectedBill.amount = parseFloat(this.selectedBill.amount).toFixed(2);
                    this.selectedBill.paid = true;
                    this.selectedBill.datePaid = new Date().toLocaleDateString();
                    this.selectedBill.paidCount++;
                    this.$store.dispatch('updateBill', this.selectedBill).then(() => {
                        this.showBillAmountModal = !this.showBillAmountModal;
                    });
                }
            }
        },
        updateBillUndoPaid(bill) {
            bill.paid = false;
            bill.datePaid = null;
            bill.paidCount--;
            this.$store.dispatch('updateBill', bill);
        },
        deleteBillConfirm(choice) {
            if (choice === "confirm") {
                this.$store.dispatch('deleteBill', this.selectedBill.id);
            }
            this.showBillDeleteModal = !this.showBillDeleteModal;
        },
        validateAmount() {
            this.errors = [];
            //Bill Amount Validation
            if (!this.selectedBill.amount || this.selectedBill.amount === null) {
                this.errors.push({ message: "Amount is required", field: "billInputAmount" });
            } else if (isNaN(this.selectedBill.amount)) {
                this.errors.push({ message: "Amount must be a number", field: "billInputAmount" });
            }
            return this.errors.length === 0;
        },
        validationFailed(field) {
            let found = this.errors.find(e => e.field === field) !== undefined;
            return found
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
        showBillDetails(bill) {
            this.selectedBill = bill;
            this.showBillDetailModal = true;
            console.log("Bill Details shown for: ", this.selectedBill.name);
        }
    }
}
</script>

<style scoped>
.add-bill {
    cursor: pointer;
    text-decoration: none;
}
.bill-detail {
    margin-top: 10px;
    margin-bottom: 10px;
    cursor: default;
    color:dimgray;
}
.bill-detail-label {
    color: white;
    background-color: teal;
    padding: 5px;
    font-weight: bolder;
    font-style: italic;
    border: 2px solid teal;
    border-radius: 10%;
    margin-right: 7.5px;
}
</style>