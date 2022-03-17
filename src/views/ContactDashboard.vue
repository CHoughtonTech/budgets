<template>
    <div class="contact-view">
        <h1>Contact Us</h1>
        <h3>Please let us know what you think of the site!</h3>
        <hr>
        <label for="subject">Subject</label>
        <div v-if="validationFailed('subject')" class="error-detail">
            {{ getErrorMessage('subject') }}
        </div>
        <input type="text" placeholder="Feedback, Issue" v-model="subject" />
        <div v-if="!isLoggedInUserEmailVerified">
            <label for="email">Email</label>
            <div v-if="validationFailed('email')" class="error-detail">
                {{ getErrorMessage('email') }}
            </div>
            <input type="text" placeholder="john.doe@example.com" v-model="email" />
        </div>
        <label for="message">Message:</label>
        <div v-if="validationFailed('message')" class="error-detail">
            {{ getErrorMessage('message') }}
        </div>
        <span :class="hasNoRemainingCharacters ? 'max-characters-exceeded' : 'max-characters'" class='is-pulled-right max-characters'>{{ remainingCharacters }} remaining</span>
        <textarea name="userMessage" id="message" style="max-width:100%;" placeholder="Here's some feedback" rows="10" v-model="message"></textarea>
        <div style="margin-bottom: 25px;">
            <button :class="hasNoRemainingCharacters ? 'disabled-button' : ''" class="is-pulled-right" @click="sendMessage()" :disabled="hasNoRemainingCharacters">
                <BaseIcon name='send'>
                    <template #pre>
                        &nbsp;Send&nbsp;
                    </template>
                </BaseIcon>
            </button>
        </div>
        <br>
        <p v-if="isMessageSentSuccessfully" class='is-flex is-justify-content-center success-message'>Message sent successfully!</p>
    </div>
</template>

<script>
import BaseIcon from '@/components/BaseIcon.vue';
import BudgetService from '@/services/BudgetService';
import { getDatabase } from '@firebase/database';
export default {
    components: {
        BaseIcon,
    },
    computed: {
        isUserLoggedIn() {
            return this.user !== null;
        },
        isLoggedInUserEmailVerified() {
            return this.user && this.user.emailVerified;
        },
        remainingCharacters() {
            return this.maxCharacters - this.message.length;
        },
        hasNoRemainingCharacters() {
            return this.remainingCharacters < 0;
        },
        userId() {
            if (!this.user || this.user === null) return null;
            return this.user.uid;
        }
    },
    data() {
        return {
            user: null,
            subject: null,
            email: '',
            message: '',
            errors: [],
            messageErrors: [],
            isMessageSentSuccessfully: false,
            maxCharacters: 250
        }
    },
    methods: {
        sendMessage() {
            if (this.validateFields()) {
                if (this.isLoggedInUserEmailVerified) {
                    this.email = this.user.email;
                }
                const messageData = {
                    subject: this.subject,
                    email: this.email,
                    message: this.message,
                    timestamp: Date.now().toString(),
                };
                BudgetService.sendMessage(getDatabase(), this.userId, messageData)
                    .then(() => {
                        this.isMessageSentSuccessfully = true;
                        this.resetForm();
                    })
                    .catch((error) => {
                        this.messageErrors.push(error);
                    });
            }
        },
        validateEmail() {
            return this.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        },
        validateFields() {
            this.errors = [];
            if (!this.subject || this.subject.length <= 0) {
                this.errors.push({ message: 'Subject is required!', field: 'subject' })
            }
            if (!this.message || this.message.length <= 0) {
                this.errors.push({ message: 'Message is required!', field: 'message' });
            }
            if (this.message && this.message.length > this.maxCharacters) {
                this.errors.push({ message: `Message too long! Please keep message to limit of ${this.maxCharacters} Characters!`, field: 'message' })
            }
            if (!this.isUserLoggedIn && !this.validateEmail()) {
                this.errors.push({ message: 'A valid email is required if you do not have an account with us!', field: 'email' });
            }
            return this.errors.length <= 0;
        },
        validationFailed(field) {
            return this.errors.find(error => error.field === field) !== undefined;
        },
        getErrorMessage(field) {
            if (this.errors.length <= 0) return null;
            const errorMessage = this.errors.find(error => error.field === field);
            return errorMessage ? `*${ errorMessage.message }` : `No errors for '${field}'`;
        },
        resetForm() {
            this.subject = null;
            this.email = '';
            this.message = '';
        }
    },
    mounted() {
        const loggedInUser = this.$store.state.user;
        if (loggedInUser && loggedInUser !== null)
            this.user = loggedInUser;
    }
}
</script>
<style scoped>
.contact-view {
    min-width: 500px;
    width: 25%;
}
.max-characters {
    color: #C15EF2;
    font-size: 12px;
}
.max-characters-exceeded {
    font-size: 12px;
    color: crimson;
}
.disabled-button {
    background-color: grey;
    cursor: not-allowed;
    color:crimson;
    border-color:lightcoral;
}
.success-message {
    color:whitesmoke;
    background-color: #411159;
    font-size: 30px;
    font-weight: bolder;
    font-style: italic;
    border: solid 2px #C15EF2;
    border-radius: 25px;
    margin-bottom: 20px;
    margin-top: 25px;
}
</style>