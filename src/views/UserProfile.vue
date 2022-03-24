<template>
    <div class='profile-view'>
        <div class="is-flex is-justify-content-center">
            <h1 v-if="!isEditing">{{ profileName }}</h1>
            <input v-else id="userName" type="text" :placeholder="profileName" v-model="userName" class="edit-username"/>
            <BaseIcon v-if="isUserEmailVerified" @click="!isEditing ? toggleIsEditing() : setUsername(userName)" :name="isEditing ? 'check-circle' : 'edit-2'" :style="isEditing ? 'stroke:forestgreen;cursor:pointer;' : 'stroke:whitesmoke;fill:whitesmoke;cursor:pointer;'"></BaseIcon>
        </div>
        <article v-if="!isUploadingPhoto" class="media is-flex is-justify-content-center">
            <figure class="media-center">
                <p class="image is-128x128">
                    <img class="is-rounded" :src="profilePhoto" alt="Profile Photo">
                </p>
                <div v-if="isUserEmailVerified && userPhoto !== ox" style="cursor:pointer;">
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
<script>
import { getAuth, sendEmailVerification, updateProfile } from 'firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage'
import BaseIcon from '@/components/BaseIcon.vue';
import BaseModal from '@/components/BaseModal.vue';
import ProfilePhoto from '@/components/ProfilePhoto.vue';
import ox from '../assets/small-ox.jpg';
export default {
    components: {
        BaseIcon,
        BaseModal,
        ProfilePhoto,
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
        isUserEmailVerified() {
            return this.user?.emailVerified;
        },
        profilePhoto() {
            const photoURL = this.$store.getters.getUserPhoto;
            return photoURL ? photoURL : this.userPhoto ? this.userPhoto : ox;
        },
        userId() {
            return this.user ? this.user.uid : undefined;
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
            const photoRef = ref(storage, this.auth.currentUser.uid);
            deleteObject(photoRef).then(() => {
                const profileData = {
                    displayName: this.userName,
                    photoURL: null,
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
            let user = getAuth().currentUser;
            updateProfile(user, profileData).then(() => {
                user.displayName = profileData.displayName;
                user.photoURL = profileData.photoURL;
                this.$store.dispatch('setUser', user);
                this.$router.go();
            });
        },
        verifyEmail() {
            const actionCodeSettings = {
                url: `https://stg--oxsoftsolutions-budgets.netlify.app/verifyCallback/${this.userEmail}`,
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