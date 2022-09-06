<script>
    import BaseIcon from './BaseIcon.vue';
    import { toCurrencyMixin } from '../mixins/GlobalMixin';
    import { defineComponent } from 'vue';
    
    export default defineComponent({    
        components: {
            BaseIcon,
        },
        mixins: [toCurrencyMixin],
        props: {
            bill: Object
        },
        computed: {
           billRecurrence() {
                switch (this.bill.recurringCycle.interval) {
                    case 3:
                        return 'Quarterly';
                    case 6: 
                        return 'Semi-Annual';
                    case 12:
                        return 'Annual';
                    default:
                        return 'Monthly'
                }
           },
        },
        methods: {
            deleteBill(bill) {
                this.$emit('delete-bill', bill);
            },
            showBillDetails(bill) {
                this.showMenu = false;
                const monthsRecurringIsDue = () => {
                    const dueDate = new Date(bill.recurringCycle.date);
                    const result = [];
                    for(let i = 0; i < 12; i++) {
                        const monthsSinceDue = Math.abs(dueDate.getMonth() - i);    
                        const isDueThisMonth = monthsSinceDue % bill.recurringCycle.interval === 0;
                        if (isDueThisMonth) result.push(i);
                    }
                    return result;
                };
                const nextRecurrenceDate = (billDueDate) => {
                    let nextDueDate = new Date(billDueDate);
                    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    [0, 1].every((y) => {
                        nextDueDate.setFullYear(new Date().getFullYear() + y);
                        monthsRecurringIsDue().every((x) => {
                            nextDueDate.setMonth(x);
                            if (nextDueDate.getTime() > firstDayOfMonth.getTime()) return false;
                            return true;
                        })
                        return nextDueDate.getTime() < firstDayOfMonth.getTime();
                    });
                    
                    return nextDueDate.toLocaleDateString();
                }
                this.$emit('bill-details', {
                    ...bill,
                    dueDate: nextRecurrenceDate(bill.recurringCycle.date),
                });
            },
            payOffBill(bill) {
                this.showMenu = false;
                this.$emit('payoff-bill', bill);
            }
        }
    })
</script>
<template>
    <div>
        <div class="bill-card -shadow">
            <div class="dropdown is-hoverable">
                <div class="dropdown-trigger">
                    <div>
                        <BaseIcon aria-haspopup="true" v-bind:aria-controls="'dropdown-menu' + bill.id" name="menu"></BaseIcon>
                    </div>
                </div>
                <div class="dropdown-menu" v-bind:id="'dropdown-menu' + bill.id" role="menu">
                    <div class="dropdown-content">
                        <div class="dropdown-item" @click="showBillDetails(bill)">
                            <BaseIcon name="help-circle">Details</BaseIcon>
                        </div>
                        <div v-if="bill.datePaidOff === '' || bill.datePaidOff === null" class="dropdown-item">
                            <router-link :to="{ name: 'edit-bill', params: { billId: bill.id } }"><BaseIcon name="edit">Edit</BaseIcon></router-link>
                        </div>
                        <div v-if="bill.datePaidOff === '' || bill.datePaidOff === null" class="dropdown-item">
                            <span @click="deleteBill(bill)"><BaseIcon name="x-circle">Delete</BaseIcon></span>
                        </div>
                        <div v-if="(bill.datePaidOff === '' || bill.datePaidOff === null) && bill.isRecurring" class="dropdown-item">
                            <span @click="payOffBill(bill)"><BaseIcon name="stop-circle">Pay Off</BaseIcon></span>
                        </div>
                    </div>
                </div>
            </div>
            <span style="color:lightgrey;">{{bill.name}}</span>
            <div class="bill-recurrence" >Recurrence: <b><i>{{ billRecurrence }}</i></b></div>
        </div>
    </div>
</template>
<style scoped>
.bill-card {
    padding: 20px;
    margin-bottom: 24px;
    transition: all 0.2s linear;
    cursor: pointer;
    border-radius:15px;
    background-color: #411159;
    color: whitesmoke;
}
.bill-recurrence {
    float: right;
    padding: 0px;
}
.bill-menu {
    position: relative;
    padding: 0px;
    display: inline-block;
    transition: all 0.2s linear;
}
.bill-menu-item {
    margin:0px;
    background-color:#411159;
    min-width: 100px;
    z-index: 1;
}
.dropdown-menu, .dropdown-content {
    background-color: #2D3033;
    color: lightgrey;
}
.dropdown-item:hover {
    background-color: #9C50B6;
}
</style>