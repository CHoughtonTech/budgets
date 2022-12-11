<script>
import BaseIcon from '../components/BaseIcon';
import IncomeCard from '../components/IncomeCard';
import { mobileCheckMixin } from '../mixins/GlobalMixin.js';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
    components: {
        BaseIcon,
        IncomeCard
    },
    mixins: [mobileCheckMixin],
    mounted() {
        if (!this.isStoreInitialized)
            this.initStore();
        if (this.user && this.user !== null)
            this.getUserIncomes();
    },
    computed: {
        ...mapState(mainStore, ['income', 'isStoreInitialized', 'user']),
        activeIncomesCount() {
            let activeIncomesCount = 0;
            if (this.income && this.income.length > 0) {
                activeIncomesCount = this.income.filter(i => i.isActive === true).length;
            }
            return activeIncomesCount;
        },
        inactiveIncomesCount() {
            let inactiveIncomesCount = 0;
            if (this.income && this.income.length > 0) {
                inactiveIncomesCount = this.income.filter(i => i.isActive === false).length;
            }
            return inactiveIncomesCount;
        },
        activeIncomes() {
            return this.income.filter(i => i.isActive === true);
        },
        inactiveIncomes() {
            return this.income.filter(i => i.isActive === false);
        },
        incomeCount() {
            let incomesCount = 0;
            if (this.income && this.income.length > 0) {
                incomesCount = this.income.length;
            }
            return incomesCount;
        },
    },
    data() {
        return {
            showAllActiveIncomes: true,
            showAllInactiveIncomes: false,
            showSelectedIncomeDetails: false
        }
    },
    methods: {
        ...mapActions(mainStore, ['deleteIncome', 'initStore', 'getUserIncomes']),
        deleteIncome(income) {
            this.deleteIncome(income.id).then(() => {
                this.$router.push('/');
            });
        },
        accordionIcon(isActive) {
            return isActive ? 'minus-circle' : 'plus-circle';
        },
        toggleShowActiveIncomes() {
            this.showAllActiveIncomes = !this.showAllActiveIncomes;
        },
        toggleShowInactiveIncomes() {
            this.showAllInactiveIncomes = !this.showAllInactiveIncomes;
        }
    }
})
</script>
<template>
    <div :class="$style['main-content']">
        <h1>Income</h1>
        <router-link
            :class="$style['add-income']"
            :to="{
                name: 'create-income'
            }"
        >
            <BaseIcon name="plus-circle">
                Add an Income
            </BaseIcon>
        </router-link>
        <div
            v-if="activeIncomesCount > 0"
            :class="[
                $style['accordion'],
                showAllActiveIncomes && $style['is-active']
            ]"
            @click="toggleShowActiveIncomes"
        >
            <BaseIcon :name="accordionIcon(showAllActiveIncomes)">
                <p>Active Incomes</p>
            </BaseIcon>
            <div
                class="badge -fill-gradient"
                :class="showAllActiveIncomes ? '' : ' -light'"
            >
                {{ activeIncomesCount }}
            </div>
        </div>
        <div
            v-if="showAllActiveIncomes"
            :class="$style['cards']"
        >
            <IncomeCard v-for="income in activeIncomes" :key="income.id" :income="income"></IncomeCard>
        </div>
        <div
            v-if="inactiveIncomesCount > 0"
            :class="[
                $style['accordion'],
                showAllInactiveIncomes && $style['is-active']
            ]"
            @click="toggleShowInactiveIncomes"
        >
            <BaseIcon :name="accordionIcon(showAllInactiveIncomes)">
                <p>Inactive Incomes</p>
            </BaseIcon>
            <div
                class="badge -fill-gradient"
                :class="showAllInactiveIncomes ? '' : ' -light'"
            >
                {{ inactiveIncomesCount }}
            </div>
        </div>
        <div
            v-if="showAllInactiveIncomes"
            :class="$style['cards']"
        >
            <IncomeCard v-for="income in inactiveIncomes" :key="income.id" :income="income"></IncomeCard>
        </div>
    </div>
</template>
<style lang="scss" module>
.main-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.accordion {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    border-radius: $border-radius-light;
    background: $dark-purple;
    color: $white;
    --icon-stroke: #{$white};
    cursor: pointer;
    &.is-active {
        --icon-stroke: #{$dark-purple};
        color: $dark-purple;
        background: $white;
    }
}
.cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.add-income {
    cursor: pointer;
    color: $light-gray;
    text-decoration: none;
    &:hover {
        color: $light-gray;
    }
}
</style>