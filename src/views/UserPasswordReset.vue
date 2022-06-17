<script>
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import BaseModal from '@/components/BaseModal.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    computed: {
        emailDisplay() {
            return this.userEmail?.replace(/^(.)(.*)(.@.*)$/,
                (_, a, b, c) => a + '*****' + c
            );
        },
    },
    components: {
        BaseModal,
    },
    props: {
        userEmail: null,
    },
    data() {
        return {
            userExists: false,
            auth: null,
            showEmailResetPassword: false,
        }
    },
    mounted() {
        this.auth = getAuth();
        if (!this.userEmail || this.userEmail === null)
            this.$router.push('/login');
        fetchSignInMethodsForEmail(this.auth, this.userEmail).then((response) => {
            this.userExists = response.length > 0;
        })
    },
    methods: {
        toggleEmailResetPassword() {
            this.showEmailResetPassword = !this.showEmailResetPassword;
        },
        resetPassword() {
            const originURL = window.location.origin;
            const actionCodeSettings = {
                url: `${originURL}/login`,
            };
            
            if (this.userExists) {
                sendPasswordResetEmail(this.auth, this.userEmail, actionCodeSettings);
            }
            this.toggleEmailResetPassword();
        }
    }
});
</script>
<template>
    <div class='reset-view'>
        <h2>Reset Password for:</h2>
        <h4>{{ emailDisplay }}</h4>
        <br/>
        <button @click="resetPassword()">Reset Password</button>
        
        <BaseModal v-if="showEmailResetPassword">
            <template #header>
                <h3 style="color:lightgrey;">Password Reset</h3>
            </template>
            <template #body>
                <p style="color:lightgrey;">If your email is valid, we have sent it an email with your password reset link.</p>
            </template>
            <template #footer>
                <div>
                    <button @click="toggleEmailResetPassword()">Ok</button>
                </div>
            </template>
        </BaseModal>
    </div>
</template>
<style scoped>
.reset-view {
    min-width: 500px;
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
h1,h2 {
    color: #C15EF2;
}
h3,h4,h5 {
    color: whitesmoke;
}
</style>