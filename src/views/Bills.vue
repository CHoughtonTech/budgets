<template>
    <div>
        <h3>{{activeMonth + ' ' + new Date().getFullYear() }} Bills</h3>
        <router-link class="add-bill" :to="{ name: 'create-bill' }"><BaseIcon name="plus-circle">Add a Bill</BaseIcon></router-link>
        <hr/>
        <BaseIcon v-if="unpaidBills.length > 0" name="arrow-right-circle"><span slot="pre">Unpaid Bills<span class="badge -fill-gradient">{{unpaidBills.length}}</span></span></BaseIcon>
        <BillCard v-for="bill in unpaidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" />
        <BaseIcon v-if="paidBills.length > 0" name="arrow-right-circle"><span slot="pre">Paid Bills</span></BaseIcon>
        <BillCard v-for="bill in paidBills" :key="bill.id" :bill="bill" @delete-bill="deleteBill" @update-paid="updateBillPaid" @update-undo-paid="updateBillUndoPaid" @bill-details="showBillDetails" />
        <BaseModal v-if="showModal">
            <h3 slot="header" style="color:Teal;">Delete Bill</h3>
            <div slot="body">
                Delete bill: <b style="color:Teal;">{{this.selectedBill.name}}</b>?
            </div>
            <div slot="footer">
                <button @click="deleteBillConfirm('confirm')">Confirm</button>
                <button @click="deleteBillConfirm('cancel')">Cancel</button>
            </div>
        </BaseModal>
    </div>
</template>

<script>
import BillCard from "../components/BillCard";
import BaseModal from "../components/BaseModal";
export default {
    components: {
        BillCard: BillCard,
        BaseModal: BaseModal
    },
    data() {
        return {
            selectedBill: Object,
            showModal: false,
            showBillModal: false
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
        }
    },
    methods: {
        deleteBill(bill) {
            this.selectedBill = bill;
            this.showModal = true;
        },
        updateBillPaid(bill) {
            this.$store.dispatch('updateBill', bill);
        },
        updateBillUndoPaid(bill) {
            this.$store.dispatch('updateBill', bill);
        },
        deleteBillConfirm(choice) {
            if (choice === "confirm") {
                this.$store.dispatch('deleteBill', this.selectedBill.id);
            }
            this.showModal = !this.showModal;
        },
        showBillDetails(bill) {
            this.selectedBill = bill;
            this.showBillModal = true;
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
</style>