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
import BaseAvatar from '@/components/BaseAvatar.vue';

export default defineComponent({
    components: {
    BaseIcon,
    BaseModal,
    ProfilePhoto,
    BaseAvatar
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
    <div :class="$style['page-layout']">
        <div :class="$style['username']">
            <h1 v-if="!isEditing">
                {{ profileName }}
            </h1>
            <input
                v-else
                id="userName"
                type="text"
                :placeholder="profileName"
                v-model="userName"
                :class="$style['edit-username']"
            />
            <BaseIcon
                v-if="isUserEmailVerified && !isEditing"
                @click="toggleIsEditing()"
                name="edit-2"
                :class="$style['edit-username-button']"
            />
            <BaseIcon
                v-if="isUserEmailVerified && userNameChanged && isEditing"
                @click="setUsername(userName)"
                name="check-circle"
                :class="$style['edit-username-confirm-button']"
            />
            <BaseIcon
                v-if="isUserEmailVerified && isEditing"
                name="x-circle"
                @click="toggleIsEditing()"
                :class="$style['edit-username-cancel-button']"
            />
        </div>
        <div
            v-if="!isUploadingPhoto"
            :class="$style['avatar']"
        >
            <BaseAvatar
                :source="profilePhoto"
                size="xx-large"
            />
            <div
                v-if="isUserEmailVerified"
                :class="$style['photo-buttons']"
            >
                <BaseIcon
                    @click="toggleUploadPhoto()"
                    name="plus-circle"
                />
                <BaseIcon
                    v-if="hasUserProfilePhoto"
                    @click="removeUserPhoto()"
                    name="x-circle"
                />
            </div>
        </div>
        <ProfilePhoto
            v-else
            @cancel-image-upload="toggleUploadPhoto()"
            @upload-image-success="setUserProfilePhoto"
            :userId="userId"
        />
        <div
            :class="$style['email-display']"
        >
            <p v-if="!isUserEmailVerified">
                {{ userEmail }}
            </p>
            <BaseIcon
                v-else
                name="user-check"
            > 
                <template #pre>
                    {{ userEmail }}
                </template>
            </BaseIcon>
        </div>
        <button @click="logout()">Logout</button>
        <button
            v-if="!isUserEmailVerified"
            @click="verifyEmail()"
        >
            Verify Email
        </button>
        <BaseModal v-if="showUpdateBillsAndIncomes">
            <template #header>
                <h3>Update Existing Data</h3>
            </template>
            <template #body>
                <p :class="$style['update-bills-incomes-paragraph']">
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
                <p :class="$style['email-verification-paragraph']">
                    Verification email sent! Check your email for an email from us; It may be in your spam folder.
                </p>
            </template>
            <template #footer>
                <button @click="toggleShowEmailVerificationSent()">
                    <BaseIcon name="check-circle" />
                </button>
            </template>
        </BaseModal>
        <BaseModal v-if="showConfirmDeclineModal">
            <template #header>
                <h3>Update Existing Data</h3>
            </template>
            <template #body>
                <p :class="$style['update-bills-incomes-paragraph-warning']">
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
                <ul :class="$style['update-bills-incomes-paragraph']">
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
<style lang="scss" module>
.page-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
}
.username {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    h1 {
        cursor: default;
    }
}
.photo-buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 50px;
    width: 100%;
    > div {
        &:first-child {
            --icon-stroke: #{$white};
            --icon-fill: #{$purple};
            cursor: pointer;
        }
        &:last-child {
            --icon-stroke: #{$white};
            --icon-fill: #{$red};
            cursor: pointer;
        }
    }
}
.email-display {
    background-color: $dark-purple;
    border: 2px solid $light-purple;
    --icon-stroke: #{darken($green, 10%)};
    --icon-fill: #{darken($green, 10%)};
    border-radius: $border-radius-light;
    font-weight: $font-weight-bold;
    padding: 10px;
    cursor: default;
}
.edit-username-button {
    --icon-stroke: #{$white};
    --icon-fill: #{$white};
    cursor: pointer;
}
.edit-username-confirm-button {
    --icon-stroke: #{$white};
    --icon-fill: #{$green};
    cursor: pointer;
}
.edit-username-cancel-button {
    --icon-stroke: #{$white};
    --icon-fill: #{$red};
    cursor: pointer;
}
.avatar {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.update-bills-incomes-paragraph .email-verification-paragraph {
    color: $white;
}
.update-bills-incomes-paragraph-warning {
    color: $red;
    font-weight: $font-weight-bolder;
    font-size: $font-size-large;
}
.edit-username {
    color: $purple;
    width: 50%;
}
</style>