<script>
import BaseIcon from './BaseIcon.vue';
import { defineComponent } from 'vue';
import ox from '@/assets/small-ox.jpg';
import { mapState } from 'pinia';
import mainStore from '@/store';
import BaseAvatar from './BaseAvatar.vue';

export default defineComponent({
    components: {
        BaseIcon,
        BaseAvatar,
    },
    computed: {
        ...mapState(mainStore, ['user']),
        userName() {
            if (!this.user || this.user === null) return null;
            return this.user.displayName ?? null;
        },
        profilePhoto() {
            if (this.user) {
                if (this.user.photoURL && this.user.photoURL !== ox) {
                    return this.user.photoURL;
                } else {
                    return ox;
                }
            } else {
                return ox;
            }
        },
        isLoggedIn() {
            return this.user !== null;
        }
    }
});
</script>
<template>
    <nav :class="$style['nav']">
        <router-link 
            :class="$style['nav-link']"
            :to="{ name: 'budget-dashboard' }"
        >
            Home
        </router-link>
        <router-link
            :class="$style['nav-link']"
            :to="{ name: 'bills' }"
        >
            Bills
        </router-link>
        <router-link
            :class="$style['nav-link']"
            :to="{ name: 'income' }"
        >
            Income
        </router-link>
        <router-link
            v-if="!isLoggedIn"
            :class="$style['nav-link']"
            :to="{ name: 'user-login' }"
        >
            <BaseIcon name="user"></BaseIcon>
        </router-link>
        <router-link
            v-else 
            :class="$style['nav-link']"
            :to="{ name: 'user-profile', params: { isRegisteringNewUser: 'false' } }"
        >
            <BaseAvatar :source="profilePhoto" />
        </router-link>
    </nav>
</template>
<style lang="scss" module>
.nav {
    overflow: hidden;
    position: fixed;
    top:0;
    width: 100%;
    background: $dark-purple;
    color: $white;
    margin: 0;
    z-index: 1;
}
.nav-link {
    display: flex;
    justify-content: center;
    align-items: center;
    color: $white;
    padding: 15px;
    --rl-active-background-color: #{$purple};
    &:hover {
        background: $light-purple;
        color: $white;
    }
}
.profile {
    padding: 15px;
    cursor: pointer;
}

</style>