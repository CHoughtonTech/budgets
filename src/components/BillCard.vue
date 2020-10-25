<template>
    <div>
        <div class="bill-card -shadow" :class="{'paid-bill' : isPaidBill, 'new-bill' : isNewBill}">
            <span @click="showBillDetails(bill)"><BaseIcon name="help-circle"></BaseIcon></span>
            <span>{{bill.name}}</span>
            <span class="delete-button" @click="deleteBill(bill)" ><BaseIcon name="x-circle"></BaseIcon></span>
            <span class="paid-button" v-if="!bill.paid" @click="paidBill(bill)" ><BaseIcon name="check-circle"></BaseIcon></span>
            <span class="undo-button" v-if="bill.paid" @click="undoBillPaid(bill)"><BaseIcon name="rotate-ccw"></BaseIcon></span>
            <div class="paid-status" v-if="bill.paid"><BaseIcon name="check">{{new Date(bill.datePaid).toLocaleDateString('en-US', {timeZone: 'UTC'})}} &nbsp;</BaseIcon></div>
            <div>{{bill.amount | currency}}</div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        bill: Object
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
            bill.paid = true;
            bill.datePaid = new Date().toLocaleDateString();
            this.$emit('update-paid', bill);
        },
        undoBillPaid(bill) {
            bill.paid = false;
            bill.datePaid = null;
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
}
.bill-card:hover {
  transform: scale(1.11);
  background-color:#43a4ff;
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
    border: 3px solid cornflowerblue;
}
.paid-bill {
    background-color: #39b982;
}
.paid-status {
    float:inherit;
}
.paid-button, .delete-button, .undo-button {
    float: right;
    padding: 0px;
}
</style>