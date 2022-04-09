<script>
import { getAuth, sendEmailVerification, updateProfile } from 'firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage'
import BaseIcon from '@/components/BaseIcon.vue';
import BaseModal from '@/components/BaseModal.vue';
import ProfilePhoto from '@/components/ProfilePhoto.vue';
import ox from '@/assets/small-ox.jpg';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
    components: {
        BaseIcon,
        BaseModal,
        ProfilePhoto,
    },
    props: {
        isRegisteringNewUser: null,
    },
    computed: {
        ...mapState(mainStore, ['user', 'bills', 'income']),
        userNameChanged() {
            return this.userName !== this.profileName && this.userName !== '';
        },
        profileName() {
            return this.user ? this.user.displayName : this.userName;
        },
        userEmail() {
            return this.user?.email;
        },
        isUserEmailVerified() {
            return this.user?.emailVerified;
        },
        hasUserProfilePhoto() {
            return this.profilePhoto !== ox && this.profilePhoto !== '';
        },
        profilePhoto() {
            if (this.user) {
                if (this.user.photoURL && this.user.photoURL !== ox) {
                    return this.user.photoURL;
                } else {
                    return this.userPhoto;
                }
            } else {
                return ox;
            }
        },
        userId() {
            return this.user ? this.user.uid : undefined;
        },
        billsCount() {
            return this.bills.length;
        },
        incomeCount() {
            return this.income.length;
        },
        hasUnsavedBillsOrIncomes() {
            const hasBills = this.bills.length > 0;
            const hasNotCreatedBills = this.bills.filter((bill) => bill.userId === this.user.uid).length <= 0;
            const hasIncomes = this.income.length > 0;
            const hasNotCreatedIncomes = this.income.filter((income) => income.userId === this.user.uid).length <= 0;
            return (hasBills || hasIncomes) && hasNotCreatedBills && hasNotCreatedIncomes;
        }
    },
    data() {
        return {
            userName: null,
            userPhoto: null,
            auth: null,
            isEditing: false,
            isUploadingPhoto: false,
            showUpdateBillsAndIncomes: false,
            showConfirmDeclineModal: false,
            showSuccessModal: false,
            showEmailVerificationSent: false,
            showAccountSettings: false,
            showPreferences: false,
            verifiedEmailStyle: 'stroke:forestgreen;color:whitesmoke;font-style:italic;fill:forestgreen;',
        }
    },
    mounted() {
        this.auth = getAuth();
        if (!this.user && this.auth.currentUser) {
            this.setUser();
        }
        if (this.user) {
            this.userName = this.user.displayName;
            this.userPhoto = this.user.photoURL ?? ox;
            const confirmedIsRegisteringNewUser = this.isRegisteringNewUser === 'true';
            if (confirmedIsRegisteringNewUser) {
                this.userConfirmedTOS('true');
            }
            if (this.hasUnsavedBillsOrIncomes && confirmedIsRegisteringNewUser) {
                this.toggleShowUpdateBillsAndIncomes();
            } else {
                if (this.bills.length <= 0)
                    this.getUserIncomes();
                if (this.income.length <= 0)
                    this.getUserBills();
            }
        }
    },
    methods: {
        ...mapActions(mainStore, ['userConfirmedTOS', 'getUserIncomes', 'getUserBills', 'setUser', 'clearUser', 'updateBill', 'updateIncome', 'clearStore']),
        toggleIsEditing() {
            if (this.userName === '' || this.userName === null) 
                this.userName = this.profileName;
            this.isEditing = !this.isEditing;
        },
        toggleShowPreferences() {
            this.showPreferences = !this.showPreferences;
        },
        toggleShowAccountSettings() {
            this.showAccountSettings = !this.showAccountSettings;
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
        toggleShowEmailVerificationSent() {
            this.showEmailVerificationSent = !this.showEmailVerificationSent;
        },
        toggleUploadPhoto() {
            this.isUploadingPhoto = !this.isUploadingPhoto;
        },
        removeUserPhoto() {
            const storage = getStorage();
            const photoRef = ref(storage, `${this.auth.currentUser.uid}/ProfilePhoto`);
            deleteObject(photoRef).then(() => {
                const profileData = {
                    displayName: this.userName,
                    photoURL: ox,
                };
                this.updateUserInfo(profileData);
            }).catch((error) => {
                console.error(error);
            });
        },
        setUserProfilePhoto(profileURL) {
            this.toggleUploadPhoto();
            const profileData = {
                displayName: this.userName, 
                photoURL: profileURL,
            };
            this.updateUserInfo(profileData);
        },
        setUsername(username) {
            this.toggleIsEditing();
            const profileData = {
                displayName: username, 
                photoURL: this.userPhoto,
            };
            this.updateUserInfo(profileData);  
        },
        updateUserInfo(profileData) {
            let authUser = this.auth.currentUser;
            updateProfile(authUser, profileData).then(() => {
                authUser.displayName = profileData.displayName;
                authUser.photoURL = profileData.photoURL;
                this.userName = authUser.displayName;
                this.userPhoto = authUser.photoURL;
                this.setUser(authUser);
            });
        },
        verifyEmail() {
            const originURL = window.location.origin;
            const actionCodeSettings = {
                url: `${originURL}/verifyCallback/${this.userEmail}`,
            };
            sendEmailVerification(this.user, actionCodeSettings)
                .then(() => {
                    this.toggleShowEmailVerificationSent()
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        confirmSuccess() {
            this.toggleShowSuccessModal();
            this.$router.push('/');
        },
        logout() {
            this.auth.signOut();
            this.clearUser();
            this.clearUserStore();
        },
        updateExistingBillsAndIncomes() {
            this.bills.forEach((bill) => {
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
                this.updateBill(newBill);
            });
            this.income.forEach((i) => {
                const newIncome = {
                    userId: this.user.uid,
                    id: i.id,
                    name: i.name,
                    type: i.type,
                    salary: i.salary,
                    netSalary: i.netSalary,
                    hourlyRate: i.hourlyRate,
                    hoursPerWeek: i.hoursPerWeek,
                    employmentType: i.employmentType,
                    filingStatus: i.filingStatus,
                    payPeriod: i.payPeriod,
                    state: i.state,
                    isActive: i.isActive,
                    isTaxExempt: i.isTaxExempt === undefined ? false : i.isTaxExempt,
                    deductions: i.deductions.map(d => { return d; })
                };
                this.updateIncome(newIncome);
            });
            this.toggleShowUpdateBillsAndIncomes();
            this.toggleShowSuccessModal();
        },
        clearUserStore() {
            this.clearStore();
            this.$router.push('/');
        }
    }
});
</script>
<template>
    <div class='profile-view'>
        <div class="is-flex is-justify-content-center">
            <h1 v-if="!isEditing">{{ profileName }}</h1>
            <input v-else id="userName" type="text" :placeholder="profileName" v-model="userName" class="edit-username"/>
            <BaseIcon v-if="isUserEmailVerified && !isEditing" @click="toggleIsEditing()" name="edit-2" :style="'stroke:whitesmoke;fill:whitesmoke;cursor:pointer;'"></BaseIcon>
            <BaseIcon v-if="isUserEmailVerified && userNameChanged && isEditing" @click="setUsername(userName)" name="check-circle" :style="'stroke:forestgreen;cursor:pointer;'"></BaseIcon>
            <BaseIcon v-if="isUserEmailVerified && isEditing" name="x-circle" @click="toggleIsEditing()" :style="'stroke:crimson;cursor:pointer;'"></BaseIcon>
        </div>
        <article v-if="!isUploadingPhoto" class="media is-flex is-justify-content-center">
            <figure class="media-center">
                <p class="image is-128x128">
                    <img class="is-rounded" :src="profilePhoto" alt="Profile Photo">
                </p>
                <div v-if="isUserEmailVerified && hasUserProfilePhoto" style="cursor:pointer;">
                    <BaseIcon @click="removeUserPhoto()" name="x-circle" :style="'fill:crimson;stroke:whitesmoke;'" class="is-pulled-right"></BaseIcon>
                </div>
                <div v-if="isUserEmailVerified" style="cursor:pointer;">
                    <BaseIcon @click="toggleUploadPhoto()" name="plus-circle" :style="'fill:#411159;stroke:whitesmoke;'" class="is-pulled-left"></BaseIcon>
                </div>
            </figure>
        </article>
        <ProfilePhoto v-if="isUploadingPhoto" @cancel-image-upload="toggleUploadPhoto()" @upload-image-success="setUserProfilePhoto" :userId="userId" ></ProfilePhoto>
        <br>
        <p class="is-flex is-justify-content-center">
            <span v-if="!isUserEmailVerified" class="user-email email-display">{{ userEmail }}</span>
            <BaseIcon class="email-display" v-else name="user-check" :style="verifiedEmailStyle"> 
                <template #pre>
                    {{ userEmail }}
                </template>
            </BaseIcon>
        </p>
        <br>
        <div class="is-flex is-justify-content-center">
            <button @click="logout()">Logout</button>
        </div>
        <div v-if="!isUserEmailVerified" class="is-flex is-justify-content-center">
            <button @click="verifyEmail()">Verify Email</button>
        </div>
        <div v-if="true === false">
            <hr>
            <div class="is-flex is-justify-content-center" :class="showAccountSettings ? 'show-settings' : 'hide-settings'" @click="toggleShowAccountSettings()">
                <h4 style="cursor:pointer;">Account Settings</h4>
            </div>
            <div v-if="showAccountSettings">
                <span style="color:whitesmoke;">Change Email </span>
                <button>Change email</button><br>
                <span style="color:whitesmoke;">Reset Password </span>
                <button>Reset Password</button>                
            </div>
            <div class="is-flex is-justify-content-center" :class="showPreferences ? 'show-settings' : 'hide-settings'" @click="toggleShowPreferences()">
                <h4 style="cursor:pointer;">Preferences</h4>
            </div>
            <div v-if="showPreferences">
                <ul style="color:whitesmoke;">
                    <li>Sort Bills Default</li>
                    <li></li>
                </ul>
            </div>
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
        <BaseModal v-if="showEmailVerificationSent">
            <template #header>
                <h3>Email Verification</h3>
            </template>
            <template #body>
                <span style="color:whitesmoke;">Verification email sent! Check your email for an email from us; It may be in your spam folder. </span>
            </template>
            <template #footer>
                <button @click="toggleShowEmailVerificationSent()">
                    <BaseIcon name="check-circle"></BaseIcon>
                </button>
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
    cursor: default;
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
.email-display {
    background-color:#411159;
    border: 2px #C15EF2 solid;
    border-radius: 25px;
    padding: 10px;
}
.edit-username {
    color: #C15EF2;
    width: 50%;
}
.button-disabled {
    background-color: grey;
    cursor: not-allowed;
    color:crimson;
    border-color:lightcoral;
}
.show-settings {
    background-color: #C15EF2;
    border: 2px solid #411159;
    color: #411159;
    border-radius: 25px;
}
.hide-settings {
    background-color: #411159;
    border: 2px solid #C15EF2;
    color:whitesmoke;
}
</style>