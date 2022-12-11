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
    <div :class="$style['page-layout']">
        <h3>Reset Password for:</h3>
        <h4>{{ emailDisplay }}</h4>
        <button @click="resetPassword()">Reset Password</button>
        
        <BaseModal v-if="showEmailResetPassword">
            <template #header>
                <h3>Password Reset</h3>
            </template>
            <template #body>
                <p>If your email is valid, we have sent it an email with your password reset link.</p>
            </template>
            <template #footer>
                <button @click="toggleEmailResetPassword()">Ok</button>
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
    gap: 10px;
    h4 {
        color: $white;
    }
}
</style>