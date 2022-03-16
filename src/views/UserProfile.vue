<template>
    <div class='profile-view'>
        <h1 class="is-flex is-justify-content-center">{{ profileName }}</h1>
        <article class="media is-flex is-justify-content-center">
            <figure class="media-center">
                <p class="image is-128x128">
                    <img class="is-rounded" :src="profilePhoto" alt="Profile Photo">
                </p>
            </figure>
        </article>
        <br><br>
        <p class="is-flex is-justify-content-center user-email">{{ userEmail }}</p>
        <br>
        <div v-if="isEditing">
            <label for="userName">Username</label>
            <input id="userName" type="text" :placeholder="profileName" v-model="userName" :disabled="!isEditing" />
            <label for="photoUrl">Photo</label>
            <textarea id='photoUrl' type="text" style="max-width:100%;" :placeholder="photoPath" v-model="userPhoto" :disabled="!isEditing" />
            <div class="is-flex is-justify-content-center">
                <button v-if="!isEditing" @click="toggleIsEditing()"><BaseIcon name='edit-2'>Edit User Info</BaseIcon></button>
                <button v-else @click="updateUserInfo()"><BaseIcon name='check-circle'>Update User Info</BaseIcon></button>
            </div>
        </div>
        <div class="is-flex is-justify-content-center">
            <button @click="logout()">Logout</button>
        </div>
        <BaseModal v-if="showUpdateBillsAndIncomes">
            <template #header>
                <h3>Update Existing Data</h3>
            </template>
            <template #body>
                <p class="update-bills-incomes-paragraph">
                    It looks like you registered after entering some information in the site! 
                    Would you like to sync that data with your profile so you can access it anywhere?
                </p>
            </template>
            <template #footer>
                <button type="button" @click="updateExistingBillsAndIncomes()">Sync</button>
                <button type="button" @click="toggleShowConfirmDeclineModal()">Decline</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showConfirmDeclineModal">
            <template #header>
                <h3>Update Existing Data</h3>
            </template>
            <template #body>
                <p class="update-bills-incomes-paragraph-warning">
                    If you decide to not do this, all current data will be wiped clean so you can start from scratch!
                </p>
            </template>
            <template #footer>
                <button type="button" @click="clearStore()">Confirm</button>
                <button type="button" @click="toggleShowConfirmDeclineModal()">Cancel</button>
            </template>
        </BaseModal>
        <BaseModal v-if="showSuccessModal">
            <template #header>
                <h3>Update Successful</h3>
            </template>
            <template #body>
                <h3>Sync Successful!</h3>
                <ul class="update-bills-incomes-paragraph">
                    <li>Bills updated: {{ billsCount }}</li>
                    <li>Incomes update: {{ incomeCount }}</li>
                </ul>
            </template>
            <template #footer>
                <button type="button" @click="confirmSuccess()">Ok</button>
            </template>
        </BaseModal>
    </div>
</template>
<script>
import { getAuth, sendEmailVerification } from 'firebase/auth';
import BaseIcon from '@/components/BaseIcon.vue';
import BaseModal from '@/components/BaseModal.vue';
import ox from '../assets/small-ox.jpg';
export default {
    components: {
        BaseIcon,
        BaseModal,
    },
    props: {
        isRegisteringNewUser: null,
    },
    computed: {
        profileName() {
            const userName = this.$store.getters.getUserName;
            return userName ? userName : this.userName;
        },
        userEmail() {
            return this.$store.getters.getEmail;
        },
        profilePhoto() {
            const photoURL = this.$store.getters.getUserPhoto;
            return photoURL ? photoURL : this.userPhoto ? this.userPhoto : ox;
        },
        photoPath() {
            const photoURL = this.$store.getters.getUserPhoto;
            return photoURL ? photoURL : this.userPhoto;
        },
        billsCount() {
            return this.$store.getters.getBills.length;
        },
        incomeCount() {
            return this.$store.getters.getIncomes.length;
        },
        hasUnsavedBillsOrIncomes() {
            const hasBills = this.$store.getters.getBills.length > 0;
            const hasNotCreatedBills = this.$store.getters.getBills.filter((bill) => bill.userId === this.user.uid).length <= 0;
            const hasIncomes = this.$store.getters.getIncomes.length > 0;
            const hasNotCreatedIncomes = this.$store.getters.getIncomes.filter((income) => income.userId === this.user.uid).length <= 0;
            return (hasBills || hasIncomes) && hasNotCreatedBills && hasNotCreatedIncomes;
        }
    },
    data() {
        return {
            userName: null,
            userPhoto: null,
            user: null,
            auth: null,
            isEditing: false,
            showUpdateBillsAndIncomes: false,
            showConfirmDeclineModal: false,
            showSuccessModal: false,
        }
    },
    mounted() {
        this.auth = getAuth();
        this.user = this.$store.state.user;
        if (this.user) {
            this.userName = this.user.displayName;
            this.userPhoto = this.user.photoURL;
            const confirmedIsRegisteringNewUser = this.isRegisteringNewUser === 'true';
            if (confirmedIsRegisteringNewUser) {
                this.$store.dispatch('userConfirmedTOS', 'true');
            }
            if (this.hasUnsavedBillsOrIncomes && confirmedIsRegisteringNewUser) {
                this.toggleShowUpdateBillsAndIncomes();
            } else {
                if (this.$store.getters.getBills.length <= 0)
                    this.$store.dispatch('getUserIncomes');
                if (this.$store.getters.getIncomes.length <= 0)
                    this.$store.dispatch('getUserBills');
            }
        }
    },
    methods: {
        toggleIsEditing() {
            this.isEditing = !this.isEditing;
        },
        toggleShowUpdateBillsAndIncomes() {
            this.showUpdateBillsAndIncomes = !this.showUpdateBillsAndIncomes;
        },
        toggleShowConfirmDeclineModal() {
            this.showConfirmDeclineModal = !this.showConfirmDeclineModal;
        },
        toggleShowSuccessModal() {
            this.showSuccessModal = !this.showSuccessModal;
        },
        updateUserInfo() {
            console.log(this.userName);
            console.log(this.userPhoto);
            this.toggleIsEditing();
        },
        verifyEmail() {
            const actionCodeSettings = {};
            sendEmailVerification(this.user, actionCodeSettings)
                .catch((error) => {
                    alert(error);
                });
        },
        confirmSuccess() {
            this.toggleShowSuccessModal();
            this.$router.push('/');
        },
        logout() {
            this.auth.signOut();
            this.$store.dispatch('clearUser');
            this.clearStore();
        },
        updateExistingBillsAndIncomes() {
            this.$store.getters.getBills.forEach((bill) => {
                const newBill = {
                    userId: this.user.uid,
                    id: bill.id,
                    name: bill.name,
                    paid:  bill.paid,
                    amount: bill.amount,
                    datePaid:  bill.datePaid,
                    dateCreated:  bill.dateCreated,
                    isRecurring:  bill.isRecurring,
                    paidCount:  bill.paidCount,
                    isFixedAmount: bill.isFixedAmount,
                    datePaidOff: bill.datePaidOff,
                    subCategoryId: bill.subCategoryId,
                    dueDate: bill.dueDate === undefined ? new Date('1/1/2019') : bill.dueDate,
                };
                this.$store.dispatch('updateBill', newBill);
            });
            this.$store.getters.getIncomes.forEach((income) => {
                const newIncome = {
                    userId: this.user.uid,
                    id: income.id,
                    name: income.name,
                    type: income.type,
                    salary: income.salary,
                    netSalary: income.netSalary,
                    hourlyRate: income.hourlyRate,
                    hoursPerWeek: income.hoursPerWeek,
                    employmentType: income.employmentType,
                    filingStatus: income.filingStatus,
                    payPeriod: income.payPeriod,
                    state: income.state,
                    isActive: income.isActive,
                    isTaxExempt: income.isTaxExempt === undefined ? false : income.isTaxExempt,
                    deductions: income.deductions.map(d => { return d; })
                };
                this.$store.dispatch('updateIncome', newIncome);
            });
            this.toggleShowUpdateBillsAndIncomes();
            this.toggleShowSuccessModal();
        },
        clearStore() {
            this.$store.dispatch('clearStore');
            this.$router.push('/');
        }
    }
}
</script>
<style scoped>
.profile-view {
    min-width: 500px;
    width:25%;
}
.user-email {
    color: whitesmoke;
    font-style: italic;
}
.user-email:hover {
    color: #C15EF2;
    cursor: default;
}
input {
    color: #C15EF2;
}
textarea {
    color: #C15EF2;
}
img {
    max-height: 150px;
    max-width: 150px;
}
.update-bills-incomes-paragraph {
    color: whitesmoke;
}
.update-bills-incomes-paragraph-warning {
    color: crimson;
    font-weight: bolder;
    font-size: 20px;
}
</style>