<template>
    <div class="user-view" @keyup.enter="isRegistering ? register() : login()">
        <h1 v-if="isRegistering">Create an Account</h1>
        <h1 v-else>Login</h1>
        <div v-if="isRegistering">
            <p class="passwordPolicy">
                <ul>
                    Password Policy:
                    <li>* No spaces</li>
                    <li>* At least 6 characters</li>
                    <li>* No more than 20 characters</li>
                    <li>* Must contain one numeric digits</li>
                    <li>* Must contain one uppercase</li>
                    <li>* Must contain one lowercase</li>
                </ul>
            </p>
            <label for="userName">Username</label>
            <div v-if="validationFailed('userName')" class="error-detail">
                {{ getErrorMessage('userName') }}
            </div>
            <input ref="username" id='userName' type="text" placeholder="Bruce Wayne" v-model="userName">
        </div>
        <label for="userEmail">Email</label>
        <div  ref="email" v-if="validationFailed('userEmail')" class="error-detail">
            {{ getErrorMessage('userEmail') }}
        </div>
        <input id="userEmail" type="text" placeholder="user@example.com" v-model="email" />
        <label for="userPassword">Password</label>
        <label class="is-pulled-right" v-if="isRegistering && password !== ''">
            Strength:&nbsp;<span :class="passwordStrengthStyle">{{ passwordStrengthText }}</span>
        </label>
        <div v-if="validationFailed('userPassword')" class="error-detail">
            {{ getErrorMessage('userPassword') }}
        </div>
        <input id="userPassword" type="password" placeholder="Password" v-model="password" />
        <div v-if="isRegistering">
            <label for="confirmPassword">Confirm Password</label>
            <div v-if="validationFailed('confirmPassword')" class="error-detail" >
                {{ getErrorMessage('confirmPassword') }}
            </div>
            <input id="confirmPassword" type="password" placeholder="Confirm Password" v-model="confirmedPassword" />
        </div>
        <br><br>
        <label v-if="isRegistering" for="userAcknowledged" class="acknowledgement">
            <span>
                By checking this box, you hereby agree to the 
                <strong class="acknowledgement-link" @click="goToPrivacyPolicy()">Privacy Policy</strong>
                 and 
                <strong class="acknowledgement-link" @click="goToTermsAndConditions()">Terms Of Use</strong>
                 of this site.
            </span>
        </label>
        <input v-if="isRegistering" id="userAcknowledged" type="checkbox" v-model="hasUserAcknowledgedTOS" /><br>
        <button :class="disableRegisterButton ? 'button-disabled' : ''" @click="isRegistering ? register() : login()" :disabled="disableRegisterButton">{{ loginRegisterLabel }}</button>
        <button @click="toggleRegisterUser()">{{ toggleRegisterUserLabel }}</button>
    </div>
</template>
<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence } from 'firebase/auth';
export default {
    data() {
        return {
            email: '',
            password: '',
            confirmedPassword: '',
            userName: '',
            auth: null,
            user: null,
            isRegistering: false,
            hasUserAcknowledgedTOS: false,
            errors: [],
        }
    },
    mounted() {
        this.auth = getAuth();
    },
    computed: {
        toggleRegisterUserLabel() {
            return this.isRegistering ? 'Login Instead' : 'New to the site? Register here';
        },
        loginRegisterLabel() {
            return this.isRegistering ? 'Register' : 'Login';
        },
        disableRegisterButton() {
            return this.isRegistering && !this.hasUserAcknowledgedTOS;
        },
        passwordStrength() {
            let tests = [];
            tests.push(new RegExp(/.{6,20}/).test(this.password)); // Length Regex
            tests.push(new RegExp(/[A-Z]/).test(this.password)); // Uppercase Regex
            tests.push(new RegExp(/[a-z]/).test(this.password)); // Lowercase Regex
            tests.push(new RegExp(/\d/).test(this.password)); // At least 1 digit Regex
            tests.push(new RegExp(/[\W_]/).test(this.password)); // Special Character Regex
            tests.push(new RegExp(/^\S+$/).test(this.password)); // No Spaces Regex
            tests.push(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])(?=^\S+$).{8,20}$/).test(this.password)); // Strongest Password Regex
            return tests.filter((t) => t === true).length;
        },
        passwordStrengthText() {
            switch (this.passwordStrength) {
                case 1,2:
                    return 'Weak';
                case 3,4,5:
                    return 'Moderate';
                case 6:
                    return 'Strong';
                case 7:
                    return 'Very Strong';
                default:
                    return 'Weak';
            }
        },
        passwordStrengthStyle() {
            switch (this.passwordStrength) {
                case 1,2:
                    return 'weak-style';
                case 3,4,5:
                    return 'moderate-style';
                case 6:
                    return 'strong-style';
                case 7:
                    return 'very-strong-style';
                default:
                    return 'weak-style';
            }
        }
    },
    methods: {
        register() {
            if (this.disableRegisterButton) return;
            if (this.validateFields()) {
                createUserWithEmailAndPassword(this.auth, this.email, this.password)
                    .then(() => {
                        this.user = this.auth.currentUser;
                        updateProfile(this.user, {
                            displayName: this.userName
                        }).then(() => {
                            this.user.displayName = this.userName;
                            this.$store.dispatch('setUser', this.user);
                            this.$router.push({ name: 'user-profile', params: { isRegisteringNewUser: 'true' }});
                        }).catch((error) => {
                            alert(error);
                        });
                    })
                    .catch((error) => {
                        const errMsg = this.getFirebaseErrorMessage(error.code);
                        this.errors.push({ message: errMsg, field: 'userName' });
                    });
            }
        },
        login() {
            if (this.validateFields()) {
                setPersistence(this.auth, browserLocalPersistence)
                    .then(() => {
                        signInWithEmailAndPassword(this.auth, this.email, this.password)
                            .then(() => {
                                this.user = this.auth.currentUser;
                                this.$store.dispatch('setUser', this.user);
                                this.$store.dispatch('clearStore');
                                this.$router.push('/profile');
                            })
                            .catch((error) => {
                                const errMsg = this.getFirebaseErrorMessage(error.code);
                                this.errors.push({ message: errMsg, field: 'userEmail' });
                            });
                    }).catch((error) => {
                        console.log(`Persistence Error on Sign-In: ${error}`);
                    });
            }
        },
        goToPrivacyPolicy() {
            const route = this.$router.resolve({ name: 'privacy-policy' });
            window.open(route.href);
        },
        goToTermsAndConditions() {
            const route = this.$router.resolve({ name: 'terms-and-conditions' });
            window.open(route.href);
        },
        toggleRegisterUser() {
            this.resetForm();
            this.isRegistering = !this.isRegistering;
        },
        resetForm() {
            this.hasUserAcknowledgedTOS = false;
            this.confirmedPassword = '';
            this.email = '';
            this.errors = [];
            this.password = '';
            this.userName = '';
        },
        validateFields() {
            this.errors = [];
            if (!this.validateEmail()) { // Email Validation
                this.errors.push({ message: 'Email is invalid!', field: 'userEmail' });
            }
            if (!this.validatePassword() && this.isRegistering) { // Password Validation
                this.errors.push({ message: 'Password did not meet the password policy!', field: 'userPassword' });
            } else if (!this.isRegistering) {
                if (!this.password || this.password === null) {
                    this.errors.push({ message: 'Password is required!', field: 'userPassword' });
                }
            }
            if ((!this.userName || this.userName === null) && this.isRegistering) { // Username Validation
                this.errors.push({ message: 'Username is required!', field: 'userName' });
            }
            if ((this.password !== this.confirmedPassword) && this.isRegistering) { // Passwords Match Validation
                this.errors.push({ message: 'Passwords do not match!', field: 'confirmPassword' })
            }
            return this.errors.length <= 0;
        },
        validationFailed(field) {
            return this.errors.find(error => error.field === field) !== undefined;
        },
        validateEmail() {
            return this.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        },
        validatePassword() {
            return this.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=^\S+$).{6,20}$/);
        },
        getFirebaseErrorMessage(errorCode) {
            let errorMessage = null;
            switch (errorCode) {
                case 'auth/user-not-found':
                    errorMessage = 'No Account with that email was found';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email is already registered';
                    break;
                default:
                    errorMessage = 'Email or password was incorrect';
                    break;
            }
            return errorMessage;
        },
        getErrorMessage(field) {
            if (this.errors.length <= 0) return null;
            const errorMessage = this.errors.find(error => error.field === field);
            return errorMessage ? `*${ errorMessage.message }` : `No errors for '${field}'`;
        },
    }
}
</script>
<style scoped>
.user-view {
    min-width: 500px;
    width: 25%;
}
input {
    border-radius: 25px;
}
button {
    border-radius: 20px;
}
.passwordPolicy {
    min-width: 250px;
    width: 25%;
    background-color: lightgrey;
    color: #411159;
    border: 2px solid;
    padding: 20px;
    margin-left: 100px;
    border-color: #C15EF2;
    border-radius: 25px;
    font-size: 12px;
    font-style:italic;
    font-weight:500;
}
.weak-style { 
    color: crimson;
}
.moderate-style {
    color: orange;
}
.strong-style {
    color: forestgreen;
}
.very-strong-style {
    color: #C15EF2;
}
.acknowledgement {
    color: #C15EF2;
    font-size: 12px;
}
.acknowledgement-link {
    color: #0e3fdf;
    cursor: pointer;
}
.acknowledgement-link:hover {
    text-decoration: underline;
    color: whitesmoke;
}
.button-disabled {
    background-color: grey;
    cursor: not-allowed;
    color:crimson;
    border-color:lightcoral;
}
</style>