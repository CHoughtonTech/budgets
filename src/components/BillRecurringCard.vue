<script>
import BaseDropdown from './BaseDropdown.vue';
import { toCurrencyMixin } from '../mixins/GlobalMixin';
import { defineComponent } from 'vue';

export default defineComponent({    
    components: {
        BaseDropdown,
    },
    mixins: [toCurrencyMixin],
    props: {
        bill: Object
    },
    data() {
        return {
            menuItems: [
                {
                    name: 'Details',
                    icon: 'help-circle'
                },
            ]
        }
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
        editBill(bill) {
            this.$router.push({ name: 'edit-bill', params: { billId: bill.id} });
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
        },
        menuItemSelected(item) {
            switch (item.toLowerCase()) {
                case 'edit':
                    this.editBill(this.bill);
                    break;
                case 'delete': 
                    this.deleteBill(this.bill);
                    break;
                case 'pay off':
                    this.payOffBill(this.bill);
                    break;
                default:
                    this.showBillDetails(this.bill);
                    break;
            }
        }
    },
    mounted() {
        if (!this.bill.datePaidOff) {
            this.menuItems.push(
                {
                    name: 'Edit',
                    icon: 'edit'
                },
                {
                    name: 'Delete',
                    icon: 'x-circle'
                }
            )
            if (this.bill.isRecurring) {
                this.menuItems.push(
                    {
                        name: 'Pay Off',
                        icon: 'stop-circle'
                    }
                )
            }
        }
    }
})
</script>
<template>
    <div>
        <div :class="$style['bill-card']">
            <div :class="$style['bill-header']">
                <BaseDropdown
                    :menu-items="menuItems"
                    @menu-item-selected="menuItemSelected"
                />
                <p>{{bill.name}}</p>
            </div>
            <div :class="$style['bill-content']">
                <p>
                    Recurrence:
                </p>
                <p>
                    {{ billRecurrence }}
                </p>
            </div>
        </div>
    </div>
</template>
<style lang="scss" module>
.bill-card {
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background: $light-gray;
    color: $white;
    padding: 0;
    --icon-stroke: #{$white};
}
.bill-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    background: $purple;
    padding: 5px 15px;
    border-radius: 7px 7px 0 0;
    font-weight: $font-weight-bold;
}
.bill-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    color: $dark-purple;
    padding: 5px 15px;
    border-radius: 0 0 7px 7px;
    font-weight: $font-weight-bolder;
    font-style: italic;
}
</style>