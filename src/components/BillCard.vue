<template>
    <div>
        <div class="bill-card -shadow" :class="{'paid-bill' : isPaidBill, 'new-bill' : isNewBill}">
            <span @click="showBillDetails(bill)"><BaseIcon name="help-circle"></BaseIcon></span>
            <span>{{bill.name}}</span>
            <span class="delete-button" @click="deleteBill(bill)" ><BaseIcon name="x-circle"></BaseIcon></span>
            <span class="paid-button" v-if="!bill.paid" @click="paidBill(bill)" ><BaseIcon name="check-circle"></BaseIcon></span>
            <span class="undo-button" v-if="bill.paid" @click="undoBillPaid(bill)"><BaseIcon name="rotate-ccw"></BaseIcon></span>
            <router-link class="edit-button" :to="{ name: 'edit-bill', params: { id: bill.id } }"><BaseIcon name="edit"></BaseIcon></router-link>
            <div class="paid-status" v-if="bill.paid"><BaseIcon name="check">{{new Date(bill.datePaid).toLocaleDateString('en-US', {timeZone: 'UTC'})}} &nbsp;</BaseIcon></div>
            <hr/>
            <div :class="{'bill-amount': !bill.paid, 'bill-amount-paid': bill.paid}">Amount {{bill.paid ? 'Paid' : 'Due'}}: {{bill.amount | currency}}</div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        bill: Object
    },
    data() {
        return {
            showMenu: false
        }
    },
    computed: {
        isPaidBill() {
            return this.bill.paid;
        },
        isNewBill() {
            return this.bill.id === this.$store.state.createdBill?.id;
        }
    },
    methods: {
        paidBill(bill) {
            this.$emit('update-paid', bill);
        },
        undoBillPaid(bill) {
            this.$emit('update-undo-paid', bill);
        },
        deleteBill(bill) {
            this.$emit('delete-bill', bill);
        },
        showBillDetails(bill) {
            this.$emit('bill-details', bill);
        }
    }
};
</script>
<style scoped>
.bill-card {
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.2s linear;
  cursor: pointer;
  border-radius:10px;
}
.bill-card:hover {
  transform: scale(1.11);
  background-color:#09dbdb;
  box-shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.2), 0 1px 15px 0 rgba(0, 0, 0, 0.19);
}
.bill-card > .title {
  margin: 0;
}
.bill-link {
  color: black;
  text-decoration: none;
  font-weight: 100;
}
.new-bill {
    border: 3px solid #09dbdb;
}
.paid-bill {
    background-color: #39b982;
}
.paid-status {
    float:inherit;
}
.paid-button, .delete-button, .undo-button, .edit-button {
    float: right;
    padding: 0px;
}
.bill-amount {
    color: gray;
    font-style:italic;
    float:right;
}
.bill-amount-paid {
    color:white;
    font-style: italic;
    float:right;
}
.bill-menu {
    position: relative;
    display: inline-block;
}
.bill-menu-item {
    display: none;
    background-color: teal;
    min-width: 100px;
    z-index: 1;
}
</style>