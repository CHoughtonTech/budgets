<script>
import BaseIcon from './BaseIcon.vue';
import BaseDropdown from './BaseDropdown.vue';
import { toCurrencyMixin } from '../mixins/GlobalMixin';
import { defineComponent } from 'vue';

export default defineComponent({    
    components: {
        BaseIcon,
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
        isPaidBill() {
            return this.bill.paid;
        },
        isNewBill() {
            let isCreatedToday = new Date(this.bill.dateCreated).toLocaleDateString() === new Date().toLocaleDateString();
            return isCreatedToday;
        },
        isPastDue() {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            if (this.bill.paid) {
                return false;
            }
            if (!this.bill.dueDate || this.bill.dueDate === '') {
                return false;
            } else if (new Date(this.bill.dueDate).getDate() < new Date().getDate() || new Date(this.bill.dueDate).getTime() < new Date(startOfMonth.toLocaleDateString()).getTime()) {
                return true;
            } else {
                return false;
            }
        },
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
            this.showMenu = false;
            this.$emit('bill-details', bill);
        },
        editBill(bill) {
            this.$router.push({ name: 'edit-bill', params: { billId: bill.id} });
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
                );
            }
        }
    }
})
</script>
<template>
    <div :class="$style['bill-card']">
        <div
            :class="[
                $style['card-header'], 
                isPastDue && $style['is-past-due'],
                isPaidBill && $style['is-paid']
            ]"
        >
            <div :class="$style['card-header-left']">
                <BaseDropdown
                    :menu-items="menuItems"
                    @menu-item-selected="menuItemSelected"
                />
                <p>{{bill.name}}</p>
            </div>
            <div
                v-if="!bill.paid"
                :class="$style['icon-button']"
                @click="paidBill(bill)"
            >
                <BaseIcon name="check-circle"></BaseIcon>
            </div>
            <div v-if="bill.paid && !bill.datePaidOff" :class="$style['icon-button']" @click="undoBillPaid(bill)">
                <BaseIcon name="rotate-ccw"></BaseIcon>
            </div>
        </div>
        <div
            :class="[
                $style['card-footer'],
                isPastDue && $style['is-past-due'],
                isPaidBill && $style['is-paid']
            ]"
        >
            <p v-if="!bill.paid">
                {{bill.dueDate}}
            </p>
            <div v-if="bill.paid">
                <BaseIcon name="check">
                    {{new Date(bill.datePaid).toLocaleDateString('en-US', {timeZone: 'UTC'}) }}
                </BaseIcon>
            </div>
            <p>
                <i>
                    {{toCurrency(bill.amount)}}
                </i>
            </p>
        </div>
    </div>
</template>
<style lang="scss" module>
.bill-card {
    border-radius: $border-radius-light;
    background: $purple;
    padding: 0;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px 10px 0 0;
    border-bottom: 0;
    padding: 15px;
}
.card-header-left {
    display: flex;
    justify-content: center;
    align-items: center;
}
.card-footer {
    display: flex;
    border-radius: 0 0 10px 10px;
    background: $light-gray;
    color: $dark-purple;
    font-weight: $font-weight-bold;
    border-top: 0;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}
.icon-button {
    cursor: pointer;
}
.is-past-due {
    background: $error-bg-color;
    color: $error-bg-color-light;
    font-weight: $font-weight-bolder;
    --icon-stroke: #{$error-font-color};
    --menu-font-color: #{$error-font-color};
    --menu-font-highlight-color: #{$error-bg-color-light};
    --menu-icon-stroke-highlight: #{$error-bg-color-light};
    --menu-icon-stroke: #{$error-font-color};
    --menu-bg-color: #{$error-bg-color-light};
    --menu-bg-color-highlight: #{$error-bg-color-dark};
    &:last-child {
        background: $error-bg-color-light;
        color: $error-bg-color-dark;
    }
}
.is-paid {
    background: $success-bg-color;
    color: $success-bg-color-light;
    font-weight: $font-weight-bolder;
    font-size: 1.2rem;
    --icon-stroke: #{$success-font-color};
    --menu-font-color: #{$success-font-color};
    --menu-font-highlight-color: #{$success-bg-color-light};
    --menu-icon-stroke-highlight: #{$success-bg-color-light};
    --menu-icon-stroke: #{$success-font-color};
    --menu-bg-color: #{$success-bg-color-light};
    --menu-bg-color-highlight: #{$success-bg-color-dark};
    &:last-child {
        background: $success-bg-color-light;
        color: $success-bg-color-dark;
    }
}
</style>