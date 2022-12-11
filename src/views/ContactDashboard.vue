<script>
import { defineComponent } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';
import BudgetService from '@/services/BudgetService';
import { getDatabase } from '@firebase/database';
import { mapState } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BaseIcon,
    },
    computed: {
        ...mapState(mainStore, ['user']),
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
        }
    },
    data() {
        return {
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
                BudgetService.sendMessage(getDatabase(), this.user?.uid , messageData)
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
    }
})
</script>
<template>
    <div :class="$style['page-layout']">
        <h1>Contact Us</h1>
        <h3>Please let us know what you think of the site!</h3>
        <hr>
        <label for="subject">Subject</label>
        <div v-if="validationFailed('subject')" class="error-detail">
            {{ getErrorMessage('subject') }}
        </div>
        <input type="text" placeholder="Feedback, Issue" v-model="subject" />
        <div v-if="!isLoggedInUserEmailVerified" :class="$style['email-section']">
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
        <textarea
            name="userMessage"
            id="message"
            :class="hasNoRemainingCharacters && $style['max-characters-textarea']"
            placeholder="Here's some feedback"
            rows="10"
            v-model="message"></textarea>
        <span :class="hasNoRemainingCharacters ? $style['max-characters-exceeded'] : $style['max-characters']">{{ remainingCharacters }} remaining</span>
        <button :class="hasNoRemainingCharacters && $style['button-disabled']" @click="sendMessage()" :disabled="hasNoRemainingCharacters">
            <BaseIcon name='send'>
                <template #pre>
                    &nbsp;Send&nbsp;
                </template>
            </BaseIcon>
        </button>
        <p v-if="isMessageSentSuccessfully" :class="$style['success-message']">Message sent successfully!</p>
    </div>
</template>
<style lang="scss" module>
.page-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
    button {
        align-self: center;
    }
}
.email-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.max-characters {
    color: $light-purple;
    font-size: $font-size-small;
    align-self: flex-end;
}
.max-characters-exceeded {
    color: $error-font-color;
    font-size: $font-size-small;
    align-self: flex-end;
}
.max-characters-textarea {
    color: $error-font-color;
    background: $error-bg-color-light;
    border: 2px solid $error-bg-color;
}
.button-disabled {
    background-color: $light-gray;
    cursor: not-allowed;
    color: $dark-gray;
    border-color:$dark-gray;
    --icon-stroke: #{$dark-gray};
    &:hover {
        background-color: $gray;
        cursor: not-allowed;
        color: $dark-gray;
        border-color:$dark-gray;
    }
}
.success-message {
    color: $success-font-color;
    background: $dark-purple;
    font-size: 1.35rem;
    font-weight: $font-weight-bolder;
    font-style: italic;
    border: solid 2px $light-purple;
    border-radius: $border-radius-medium;
    padding: 10px;
}
</style>