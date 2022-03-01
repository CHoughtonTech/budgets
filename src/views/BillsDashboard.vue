<template>
    <div class="bills-view">
        <h3 style="color:lightgrey;">{{activeMonth + ' ' + new Date().getFullYear() }} Bills</h3>
        <div>
            <div v-if="this.$store.getters.activeBillCount > 0" class="bill-summary -shadow">
                <div class="bill-summary-header">Summary</div>
                <div class="bill-summary-item">Recurring Bills Total: {{ recurringBillsTotal | currency }}</div>
                <div class="bill-summary-item">Bills Total: {{activeBillsTotal | currency}}</div>
                <div class="bill-summary-item">Total Paid: {{totalPaid | currency}}</div>
                <div class="bill-summary-item">Total Due: {{totalDue | currency}}</div>
            </div>
            <div v-if="unpaidBills.length > 0 && totalPastDue > 0" class="overdue-bill">
                <div class='overdue-bill-count'>Past Due Bills: {{totalPastDue}}</div>
                <div class="overdue-bill-total">Total Past Due: {{totalPastDueTotal | currency}}</div>
            </div>
            <br/>
            <router-link class="add-bill" :to="{ name: 'create-bill' }"><BaseIcon name="plus-circle">Add a Bill</BaseIcon></router-link>
            <hr/>
            <div v-if="unpaidBills.length > 0 || paidBills.length > 0">
                <div class="buttons has-addons is-centered">
                    <button class="button is-rounded" :class="{'is-selected is-sorted' : this.sortMethod === 'dueDate', 'is-dark': this.sortMethod !== 'dueDate'}" @click="setSort('dueDate')">
                        <BaseIcon :name="(this.ascending && this.sortMethod === 'dueDate' ? 'chevron-up' : 'chevron-down')">
                            <span slot="pre">Date Due</span>
                        </BaseIcon>
                    </button>
                    <button class="button" :class="{'is-selected is-sorted' : this.sortMethod === null, 'is-dark': this.sortMethod !== null}" @click="setSort(null)">
                        <BaseIcon :name="(this.ascending && this.sortMethod === null ? 'chevron-up' : 'chevron-down')">
                            <span slot="pre">Name</span>
                        </BaseIcon>
                    </button>
                    <button class="button is-rounded" :class="{'is-selected is-sorted' : this.sortMethod === 'amount', 'is-dark': this.sortMethod !== 'amount'}" @click="setSort('amount')">
                        <BaseIcon :name="(this.ascending && this.sortMethod === 'amount' ? 'chevron-up' : 'chevron-down')">
                            <span slot="pre">Amount</span>
                        </BaseIcon>
                    </button>
                </div>
            </div>
            <br/>
            <BaseIcon v-if="unpaidBills.length > 0" name="arrow-right-circle"><span slot="pre">Unpaid Bills<span class="badge -fill-gradient">{{unpaidBills.length}} / {{this.$store.getters.activeBillCount}}</span></span></BaseIcon>
            <br v-if="unpaidBills.length > 0" /><br v-if="unpaidBills.length > 0" />
            <BillCard v-for="bill in unpaidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" @payoff-bill="toggleBillPayOffModal"/>
            <BaseIcon v-if="paidBills.length > 0" name="arrow-right-circle"><span slot="pre">Paid Bills</span></BaseIcon>
            <br/><br/>
            <BillCard v-for="bill in paidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" @payoff-bill="toggleBillPayOffModal"/>
            <BaseModal v-if="showBillDeleteModal">
                <h3 slot="header" style="color:#411159">Delete Bill</h3>
                <div slot="body">
                    Delete bill: <b style="color:#411159;">{{this.selectedBill.name}}</b>?
                </div>
                <div slot="footer">
                    <button @click="deleteBillConfirm('confirm')">Confirm</button>
                    <button @click="deleteBillConfirm('cancel')">Cancel</button>
                </div>
            </BaseModal>
            <BaseModal v-if="showBillAmountModal">
                <h3 slot="header" style="color:#411159;">Enter Amount</h3>
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
                <h3 slot="header" style="color:#C15EF2;">{{selectedBill.name}}</h3>
                <div slot="body">
                    <br/>
                    <div class="bill-detail"><span class="bill-detail-label">Amount</span>{{selectedBill.amount | currency}}</div>
                    <div class="bill-detail"><span class="bill-detail-label">Created</span>{{selectedBill.dateCreated}}</div>
                    <div class="bill-detail"><span class="bill-detail-label">Due</span>{{selectedBill.dueDate ? selectedBill.dueDate : "--"}}</div>
                    <div class="bill-detail"><span class="bill-detail-label">Recurring</span><BaseIcon :name="selectedBill.isRecurring ? 'check' : 'x'"></BaseIcon></div>
                    <div class="bill-detail"><span class="bill-detail-label">Fixed Amount</span><BaseIcon :name="selectedBill.isFixedAmount ? 'check' : 'x'"></BaseIcon></div>
                    <div class="bill-detail"><span class="bill-detail-label">Category</span>{{selectedCategory}}</div>
                    <div class="bill-detail"><span class="bill-detail-label">SubCategory</span>{{selectedSubCategory}}</div>
                    <div class="bill-detail"><span class="bill-detail-label">Paid</span><i><strong style="color:lightgrey;">{{selectedBill.paidCount}}</strong></i> time{{selectedBill.paidCount === 1 ? '' : 's'}}</div>
                    <div v-if="selectedBill.datePaidOff !== '' && selectedBill.datePaidOff !== null" class="bill-detail"><span class="bill-detail-label">Paid Off</span><BaseIcon name="check"></BaseIcon></div>
                </div>
                <div slot="footer">
                    <button style="float:right;" @click="showBillDetailModal = false">Ok</button>
                    <br/><br/>
                </div>
            </BaseModal>
            <BaseModal v-if="showBillPayOffModal">
                <h3 slot="header">{{selectedBill.name}}</h3>
                <div slot="body" style="color:whitesmoke;">
                    Mark bill: <strong style="color:whitesmoke;">{{selectedBill.name}}</strong> as paid off?
                </div>
                <div slot="footer">
                    <button @click="updateBillPayOffConfirm('confirm')">Confirm</button>
                    <button @click="updateBillPayOffConfirm('cancel')">Cancel</button>
                </div>
            </BaseModal>
        </div>
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
            showBillPayOffModal: false,
            ascending: true,
            sortMethod: null,
            sortType: {
                NAME: "name",
                DUEDATE: "dueDate",
                AMOUNT: "amount"
            },
            errors: []
        }
    },
    computed: {
        paidBills() {
            const paidBills = this.$store.getters.activeBills.filter(b => b.paid === true);
            return this.sortBills(paidBills, this.sortMethod);
        },
        unpaidBills() {
            const unpaidBills = this.$store.getters.activeBills.filter(b => b.paid === false);
            return this.sortBills(unpaidBills, this.sortMethod);
        },
        totalDue() {
            let total = 0;
            this.unpaidBills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total;
        },
        totalPaid() {
            let total = 0;
            this.paidBills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total;
        },
        totalPastDueTotal() {
            let total = 0;
            this.unpaidBills.forEach(bill => {
                if (bill.dueDate !== null & bill.dueDate !== '' && new Date(bill.dueDate).getDate() < new Date().getDate()) {
                    total += parseFloat(bill.amount);
                }
            });
            return total;
        },
        totalPastDue() {
            let billsPastDue = 0;
            this.unpaidBills.forEach(bill => {
                if (bill.dueDate !== null & bill.dueDate !== '' && new Date(bill.dueDate).getDate() < new Date().getDate()) {
                    billsPastDue += 1;
                }
            });
            return billsPastDue;
        },
        activeBillsTotal() {
            let total = 0;
            this.$store.getters.activeBills.forEach(bill => {
                if (bill.datePaidOff === null || bill.datePaidOff === '') {
                    total += parseFloat(bill.amount);
                }
            });
            return total;
        },
        recurringBillsTotal() {
            const recurringBills = this.$store.getters.activeBills.filter(b => b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === ''));
            let total = 0;
            recurringBills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total;
        },
        activeMonth() {
            if (this.$store.state.activeMonth && this.$store.state.activeMonth !== null) {
                return this.$store.state.activeMonth.name;
            }
            return new Date().toLocaleString('default', { month: 'long' });
        },
        selectedCategory() {
            return this.$store.getters.getCategoryNameById(this.selectedBill?.subCategoryId);
        },
        selectedSubCategory() {
            return this.$store.getters.getSubCategoryNameById(this.selectedBill?.subCategoryId);
        }
    },
    methods: {
        sortBills(bills, sortMethod) {
            if(!bills || bills === null) { return []; }
            switch (sortMethod) {
                case 'dueDate':
                    return bills.sort((a,b) => {
                        let x = a.dueDate ? new Date(a.dueDate).getDate() : null;
                        let y = b.dueDate ? new Date(b.dueDate).getDate() : null;
                        if (x < y) {return this.ascending ? -1 : 1}
                        if (y < x) {return this.ascending ? 1 : -1}
                        return 0;
                    });
                case 'amount': 
                    return bills.sort((a,b) => {
                        let x = typeof a.amount === 'number' ? a.amount : parseFloat(a.amount);
                        let y = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount);
                        if (x < y) { return this.ascending ? -1 : 1 }
                        if (x > y) { return this.ascending ? 1 : -1 }
                        return 0;
                    });
                default:
                    return bills.sort((a,b) => {
                        let x = a.name.toLowerCase();
                        let y = b.name.toLowerCase();
                        if (x < y) { return this.ascending ? -1 : 1 }
                        if (x > y) { return this.ascending ? 1 : -1 }
                        return 0;
                    });
            }
        },
        setSort(sortType) {
            if (this.sortMethod === sortType) {
                this.ascending = !this.ascending;   
            } else if (this.sortMethod !== sortType) {
                this.ascending = true;
            }
            this.sortMethod = sortType;
        },
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
        toggleBillPayOffModal(bill) {
            this.selectedBill = bill;
            this.showBillPayOffModal = !this.showBillPayOffModal;
        },
        updateBillPayOffConfirm(choice) {
            if (choice === 'cancel') {
                this.showBillPayOffModal = !this.showBillPayOffModal;
            } else {
                this.selectedBill.paid = true;
                this.selectedBill.datePaid = new Date().toLocaleDateString();
                this.selectedBill.datePaidOff = this.selectedBill.datePaid;
                this.selectedBill.paidCount++;
                this.$store.dispatch('updateBill', this.selectedBill).then(() => {
                    this.showBillPayOffModal = !this.showBillPayOffModal;
                });
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
.bills-view {
    min-width: 500px;
    width: 25%;
}
.add-bill {
    cursor: pointer;
    text-decoration: none;
}
.bill-detail {
    background: #2D3033;
    margin-top: 10px;
    margin-bottom: 10px;
    cursor: default;
    color: lightgrey;
}
.bill-detail-label {
    color: lightgrey;
    background-color: #411159;
    padding: 5px;
    font-weight: bolder;
    font-style: italic;
    border: 2px solid #411159;
    border-radius: 10%;
    margin-right: 7.5px;
}
.bill-summary {
    transition: all 0.2s linear;
    border-radius: 10px;
    color: lightgrey;
    margin-bottom: 25px;
    margin-top: 25px;
}
.bill-summary-header {
    background-color: #411159;
    border-radius: 10px 10px 0 0;
    color:white;
    font-size:large;
    padding-left: 10px;
    font-weight: bold;
    border-bottom: 2px solid #C15EF2;
}
.bill-summary-item {
    padding-left: 10px;
    font-style:italic;
}
.is-sorted {
    background-color: #8834B3;
    color: lightgrey;
    border: 1px solid #8834B3;
}
.overdue-bill {
    border: 2px solid lightcoral;
    border-radius: 10px;
    background-color:crimson;
    color:whitesmoke;
}
.overdue-bill-count {
    padding-left: 10px;
    float: left;
    font-weight: bolder;
}
.overdue-bill-total {
    text-align:right;
    padding-right: 10px;
    font-style:italic;
    font-weight:bolder;
}
</style>