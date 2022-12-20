<script>
import BillCard from '../components/BillCard';
import BillRecurringCard from '@/components/BillRecurringCard';
import BaseModal from '../components/BaseModal';
import BaseIcon from '../components/BaseIcon';
import { toCurrencyMixin } from '../mixins/GlobalMixin';
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BillCard,
        BillRecurringCard,
        BaseModal,
        BaseIcon,
    },
    mixins: [toCurrencyMixin],
    data() {
        return {
            selectedBill: Object,
            showBillDeleteModal: false,
            showBillDetailModal: false,
            showBillAmountModal: false,
            showBillPayOffModal: false,
            showAllRecurringBills: false,
            showAllUnpaidBills: true,
            showAllPaidBills: false,
            ascending: true,
            sortMethod: 'dueDate',
            sortType: {
                NAME: 'name',
                DUEDATE: 'dueDate',
                AMOUNT: 'amount'
            },
            currentMonth: new Date().toLocaleString('default', { month: 'long' }),
            errors: []
        }
    },
    mounted() {
        if (!this.isStoreInitialized)
            this.initStore();
        if (this.user && this.user !== null)
            this.getUserBills();
    },
    computed: {
        ...mapState(mainStore, ['activeBills', 'getCategoryNameById', 'getSubCategoryNameById', 'activeBillCount', 'isStoreInitialized', 'user', 'hasBills', 'bills']),
        paidBills() {
            const paidBills = this.activeBills.filter(b => b.paid === true);
            return this.sortBills(paidBills, this.sortMethod);
        },
        unpaidBills() {
            const unpaidBills = this.activeBills.filter(b => b.paid === false);
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
            this.activeBills.forEach(bill => {
                if (bill.datePaidOff === null || bill.datePaidOff === '') {
                    total += parseFloat(bill.amount);
                }
            });
            return total;
        },
        recurringBillsTotal() {
            const recurringBills = this.activeBills.filter(b => b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === ''));
            let total = 0;
            recurringBills.forEach(bill => {
                total += parseFloat(bill.amount);
            });
            return total;
        },
        selectedCategory() {
            return this.getCategoryNameById(this.selectedBill?.subCategoryId);
        },
        selectedSubCategory() {
            return this.getSubCategoryNameById(this.selectedBill?.subCategoryId);
        },
        selectedBillRecurrence() {
            if (this.selectedBill && !this.selectedBill.isRecurring) return '';
            switch (this.selectedBill.recurringCycle?.interval) {
                case 3:
                    return 'Quarterly';
                case 6:
                    return 'Semi-Annual';
                case 12: 
                    return 'Annual';
                default:
                    return 'Monthly';
            }
        },
        allRecurringBills() {
            return this.sortBills(this.bills.filter((x) => x.isRecurring && !x.datePaidOff), 'name');
        }
    },
    methods: {
        ...mapActions(mainStore, ['deleteBill', 'updateBill', 'initStore', 'getUserBills']),
        sortBills(bills, sortMethod) {
            if(!bills || bills === null) { return []; }
            switch (sortMethod) {
                case 'amount': 
                    return bills.sort((a,b) => {
                        let x = typeof a.amount === 'number' ? a.amount : parseFloat(a.amount);
                        let y = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount);
                        if (x < y) { return this.ascending ? -1 : 1 }
                        if (x > y) { return this.ascending ? 1 : -1 }
                        return 0;
                    });
                case 'name': 
                    return bills.sort((a,b) => {
                        let x = a.name.toLowerCase();
                        let y = b.name.toLowerCase();
                        if (x < y) { return this.ascending ? -1 : 1 }
                        if (x > y) { return this.ascending ? 1 : -1 }
                        return 0;
                    });
                default:
                    return bills.sort((a,b) => {
                        let x = a.dueDate ? new Date(a.dueDate).getDate() : null;
                        let y = b.dueDate ? new Date(b.dueDate).getDate() : null;
                        if (x < y) {return this.ascending ? -1 : 1}
                        if (y < x) {return this.ascending ? 1 : -1}
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
        deleteUserBill(bill) {
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
                this.updateBill(bill);
            }
        },
        toggleBillPayOffModal(bill) {
            this.selectedBill = bill;
            this.showBillPayOffModal = !this.showBillPayOffModal;
        },
        toggleShowAllRecurringBills() {
            this.showAllRecurringBills = !this.showAllRecurringBills;
        },
        toggleShowAllUnpaidBills() {
            this.showAllUnpaidBills = !this.showAllUnpaidBills;
        },
        toggleShowAllPaidBills() {
            this.showAllPaidBills = !this.showAllPaidBills;
        },
        updateBillPayOffConfirm(choice) {
            if (choice === 'cancel') {
                this.showBillPayOffModal = !this.showBillPayOffModal;
            } else {
                this.selectedBill.paid = true;
                this.selectedBill.datePaid = new Date().toLocaleDateString();
                this.selectedBill.datePaidOff = this.selectedBill.datePaid;
                this.selectedBill.paidCount++;
                this.updateBill(this.selectedBill).then(() => {
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
                    this.updateBill(this.selectedBill).then(() => {
                        this.showBillAmountModal = !this.showBillAmountModal;
                    });
                }
            }
        },
        updateBillUndoPaid(bill) {
            bill.paid = false;
            bill.datePaid = null;
            bill.paidCount--;
            this.updateBill(bill);
        },
        deleteBillConfirm(choice) {
            if (choice === 'confirm') {
                this.deleteBill(this.selectedBill.id);
            }
            this.showBillDeleteModal = !this.showBillDeleteModal;
        },
        validateAmount() {
            this.errors = [];
            //Bill Amount Validation
            if (!this.selectedBill.amount || this.selectedBill.amount === null) {
                this.errors.push({ message: 'Amount is required', field: 'billInputAmount' });
            } else if (isNaN(this.selectedBill.amount)) {
                this.errors.push({ message: 'Amount must be a number', field: 'billInputAmount' });
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
        },
        accordionIcon(isActive) {
            return isActive ? 'minus-circle' : 'plus-circle';
        },
        activeAccordionStyle(isActive) {
            return isActive ? 'stroke:$dark-purple;color:$dark-purple' : '';
        }
    }
})
</script>
<template>
    <div :class="$style['main-content']">
        <h3>
            {{currentMonth + ' ' + new Date().getFullYear() }} Bills
        </h3>
        <div v-if="activeBillCount > 0" :class="$style['bill-summary']">
            <div :class="$style['bill-summary-header']">Summary</div>
            <div :class="$style['bill-summary-item']">Recurring Bills Total: {{ toCurrency(recurringBillsTotal) }}</div>
            <div :class="$style['bill-summary-item']">Bills Total: {{ toCurrency(activeBillsTotal) }}</div>
            <div :class="$style['bill-summary-item']">Total Paid: {{ toCurrency(totalPaid) }}</div>
            <div :class="$style['bill-summary-item']">Total Due: {{ toCurrency(totalDue) }}</div>
        </div>
        <div
            v-if="unpaidBills.length > 0 && totalPastDue > 0"
            class="context -error"
            :class="$style['overdue-bill']"
        >
            <div>
                <p>Overdue Bills</p>
                <p>{{ totalPastDue }}</p>
            </div>
            <div>
                <p>Total Due</p>
                <p>{{ toCurrency(totalPastDueTotal) }}</p>
            </div>
        </div>
        <router-link
            :to="{ name: 'create-bill' }"
            :class="$style['add-bill']"
        >
            <BaseIcon name="plus-circle">
                Add a Bill
            </BaseIcon>
        </router-link>
        <div
            v-if="unpaidBills.length > 0 || paidBills.length > 0"
            :class="$style['sort-button-group']"
        >
            <button
                :class="sortMethod === 'dueDate' && $style['is-sorted']"
                @click="setSort('dueDate')"
            >
                <BaseIcon :name="(ascending && sortMethod === 'dueDate' ? 'chevron-up' : 'chevron-down')">
                    <template #pre>
                        <span>Due</span>
                    </template>
                </BaseIcon>
            </button>
            <button
                :class="sortMethod === 'name' && $style['is-sorted']"
                @click="setSort('name')"
            >
                <BaseIcon :name="(ascending && sortMethod === 'name' ? 'chevron-up' : 'chevron-down')">
                    <template #pre>
                        <span>Name</span>
                    </template>
                </BaseIcon>
            </button>
            <button
                :class="sortMethod === 'amount' && $style['is-sorted']"
                @click="setSort('amount')"
            >
                <BaseIcon :name="(ascending && sortMethod === 'amount' ? 'chevron-up' : 'chevron-down')">
                    <template #pre>
                        <span>Amt</span>
                    </template>
                </BaseIcon>
            </button>
        </div>
        <div
            v-if="unpaidBills.length > 0"
            :class="$style[showAllUnpaidBills ? 'accordion-active': 'accordion']"
            @click="toggleShowAllUnpaidBills"
        >
            <BaseIcon
                v-if="unpaidBills.length > 0"
                :name="accordionIcon(showAllUnpaidBills)"
            >
                <span>Unpaid Bills</span>
            </BaseIcon>
            <div
                class="badge -fill-gradient"
                :class="showAllUnpaidBills ? '' : ' -light'"
            >
                {{unpaidBills.length}} / {{activeBillCount}}
            </div>
        </div>
        <div
            v-if="showAllUnpaidBills"
            :class="$style['cards']"
        >
            <BillCard
                v-for="bill in unpaidBills"
                :key="bill.id"
                :bill="bill"
                @delete-bill="deleteUserBill"
                @update-paid="updateBillPaid"
                @update-undo-paid="updateBillUndoPaid"
                @bill-details="showBillDetails"
                @payoff-bill="toggleBillPayOffModal"
            />
        </div>
        <div
            v-if="paidBills.length > 0"
            :class="$style[showAllPaidBills ? 'accordion-active': 'accordion']"
            @click="toggleShowAllPaidBills"
        >
            <BaseIcon v-if="paidBills.length > 0" :name="accordionIcon(showAllPaidBills)">
                <span>Paid Bills</span>
            </BaseIcon>
            <div
                class="badge -fill-gradient"
                :class="showAllPaidBills ? '' : ' -light'"
            >
                {{paidBills.length}} / {{activeBillCount}}
            </div>
        </div>
        <div
            v-if="showAllPaidBills"
            :class="$style['cards']"
        >
            <BillCard
                v-for="bill in paidBills"
                :key="bill.id"
                :bill="bill"
                @delete-bill="deleteUserBill"
                @update-paid="updateBillPaid"
                @update-undo-paid="updateBillUndoPaid"
                @bill-details="showBillDetails"
                @payoff-bill="toggleBillPayOffModal"
            />
        </div>
        <div
            v-if="allRecurringBills.length > 0"
            :class="$style[showAllRecurringBills ? 'accordion-active': 'accordion']"
            @click="toggleShowAllRecurringBills"
        >
            <BaseIcon v-if="allRecurringBills.length > 0" :name="accordionIcon(showAllRecurringBills)">
                <span>All Recurring Bills</span>
            </BaseIcon>
            <div
                class="badge -fill-gradient"
                :class="showAllRecurringBills ? '' : ' -light'"
            >
                {{allRecurringBills.length}}
            </div>
        </div>
        <div
            v-if="showAllRecurringBills"
            :class="$style['cards']"
        >
            <BillRecurringCard
                v-for="bill in allRecurringBills"
                :key="bill.id + bill.recurringCycle.interval"
                :bill="bill"
                @delete-bill="deleteUserBill"
                @bill-details="showBillDetails"
                @payoff-bill="toggleBillPayOffModal"
            />
        </div>
        <BaseModal v-if="showBillDeleteModal">
            <template #header>
                <h3>Delete Bill</h3>
            </template>
            <template #body>
                <p>
                    Delete bill: <b>{{selectedBill.name}}</b>?
                </p>
            </template>
            <template #footer>
                <button @click="deleteBillConfirm('confirm')">Confirm</button>
                <button @click="deleteBillConfirm('cancel')">Cancel</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showBillAmountModal">
            <template #header>
                <h3>Enter Amount</h3>
            </template>
            <template #body>
                <h4>Bill: {{selectedBill.name}}</h4>
                <label for="billInputAmount">Amount</label>
                <div v-if="validationFailed('billInputAmount')" class="error-detail">{{getErrorMessage('billInputAmount')}}</div>
                <input type="number" v-model="selectedBill.amount" :class="{'error-detail-input': validationFailed('billInputAmount')}" />
            </template>
            <template #footer>
                <button @click="updateBillPaidConfirm('confirm')">Confirm</button>
                <button @click="updateBillPaidConfirm('cancel')">Cancel</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showBillDetailModal">
            <template #header>
                <h3>{{selectedBill.name}}</h3>
            </template>
            <template #body>
                <div :class="$style['bill-detail-wrapper']">
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Amount</p>
                        <p>{{ toCurrency(selectedBill.amount) }}</p>
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Due</p>
                        <p>
                            {{ selectedBill.dueDate ? selectedBill.dueDate : "--" }}
                        </p>
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">
                            {{ selectedBill.isRecurring ? 'Recurrence:' : 'Recurring' }}
                        </p>
                        <div>
                            <BaseIcon v-if="!selectedBill.isRecurring" :name="'x'" />
                            <p v-else>{{ selectedBillRecurrence }}</p>
                        </div>
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Fixed Amount</p>
                        <BaseIcon :name="selectedBill.isFixedAmount ? 'check' : 'x'" />
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Category</p>
                        <p>{{ selectedCategory }}</p>
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Subcategory</p>
                        <p>{{ selectedSubCategory }}</p>
                    </div>
                    <div :class="$style['bill-detail']">
                        <p :class="$style['bill-detail-label']">Paid</p>
                        <p>
                            <i><b>{{ selectedBill.paidCount }}</b></i> time{{ selectedBill.paidCount === 1 ? '' : 's' }}
                        </p>
                    </div>
                    <div
                        v-if="selectedBill.datePaidOff !== '' && selectedBill.datePaidOff !== null"
                        :class="$style['bill-detail']"
                    >
                        <p :class="$style['bill-detail-label']">Paid Off</p>
                        <BaseIcon name="check"></BaseIcon>
                    </div>
                </div>
            </template>
            <template #footer>
                <button @click="showBillDetailModal = false">Ok</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showBillPayOffModal">
            <template #header>
                <h3>{{selectedBill.name}}</h3>
            </template>
            <template #body>
                <p>
                    Mark bill: <strong>{{selectedBill.name}}</strong> as paid off?
                </p>
            </template>
            <template #footer>
                <button @click="updateBillPayOffConfirm('confirm')">Confirm</button>
                <button @click="updateBillPayOffConfirm('cancel')">Cancel</button>
            </template>
        </BaseModal>
    </div>
</template>
<style lang="scss" module>
.main-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.add-bill {
    color: $secondary-font-color;
    &:hover {
        color: $secondary-font-color;
    }
}
.accordion {
    --icon-stroke: #{$white};
    display: flex;
    justify-content: space-between;
    background: $dark-purple;
    padding: 20px;
    border-radius: $border-radius-light;
    cursor: pointer;
}
.accordion-active {
    --icon-stroke: #{$dark-purple};
    display: flex;
    justify-content: space-between;
    background: $white;
    color: $dark-purple;
    stroke: var(--icon-stroke);
    border: 3px solid $dark-purple;
    padding: 20px;
    border-radius: $border-radius-light;
    cursor: pointer;
}
.bill-detail-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.bill-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $gray;
    border-radius: $border-radius-light;
    padding: 10px;
    gap: 10px;
    cursor: default;
}
.bill-detail-label {
    color: $white;
    background-color: $dark-purple;
    padding: 5px;
    font-weight: $font-weight-bolder;
    font-style: italic;
    border: 2px solid $dark-purple;
    border-radius: $border-radius-light;
    margin-right: 7.5px;
}
.bill-summary {
    border: 2px solid $dark-purple;
    border-radius: $border-radius-light;
    background: $light-gray;
    color: $purple;
    font-weight: $font-weight-semi-bold;
    width: 100%;
}
.bill-summary-header {
    background-color: $dark-purple;
    border-radius: $border-radius-light $border-radius-light 0 0;
    color:$white;
    font-size: $font-size-large;
    padding-left: 10px;
    font-weight: $font-weight-bold;
}
.bill-summary-item {
    padding-left: 10px;
    font-style:italic;
}
.is-sorted {
    background-color: $purple;
    color: $light-gray;
    border: 1px solid $purple;
}
.overdue-bill {
    display: flex;
    justify-content: space-between;
    font-weight: $font-weight-bold;
}
.cards {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.sort-button-group {
    display: flex;
    justify-content: center;
    width: 100%;
    > button {
        gap: 0;
        margin: 0;
        border: unset;
        border-radius:0;

        &:first-child {
            border-radius: 25px 0 0 25px;
        }
        &:last-child {
            border-radius: 0 25px 25px 0;
        }
        &:focus-within {
            border: 0;
        }
        &:hover {
            color: $white;
            background: $dark-purple;
            &.is-sorted {
                color: $secondary-font-color;
                background: $purple;
            }
        }
    }
}
</style>