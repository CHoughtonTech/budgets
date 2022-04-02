<script>
import BaseIcon from './BaseIcon.vue';
import { defineComponent } from 'vue';
import ox from '@/assets/small-ox.jpg';
import { mapState } from 'pinia';
import mainStore from '@/store';

export default defineComponent({
    components: {
        BaseIcon,
    },
    computed: {
        ...mapState(mainStore, ['user']),
        userName() {
            if (!this.user || this.user === null) return null;
            return this.user.displayName ?? null;
        },
        profilePhoto() {
            if (!this.user || this.user === null) return ox;
            return this.user.photoURL;
        },
        isLoggedIn() {
            return this.user !== null;
        }
    }
});
</script>
<template>
    <div id="nav" class="nav">
        <nav>
            <router-link class="nav-link" :to="{ name: 'budget-dashboard' }">Home</router-link>
            <router-link class="nav-link" :to="{ name: 'bills' }">Bills</router-link>
            <router-link class="nav-link" :to="{ name: 'income' }">Income</router-link>
            <router-link v-if="!isLoggedIn" class="nav-link is-pulled-right" :to="{ name: 'user-login' }"><BaseIcon name="user">Login</BaseIcon></router-link>
            <router-link v-else class="nav-link is-pulled-right" :to="{ name: 'user-profile', params: { isRegisteringNewUser: 'false' } }">
                <BaseIcon v-if="!isLoggedIn" name="user">Profile</BaseIcon>
                <div v-else>
                    <article class="media">
                        <figure class="media-center">
                            <div class="image is-24x24 is-pulled-left">
                                <img class="is-rounded" :src="profilePhoto">
                            </div>
                            <span style="margin-left:6px;">{{ userName }}</span>
                        </figure>
                    </article>
                </div>
            </router-link>
        </nav>
    </div>
</template>
<style>
.nav {
    overflow:hidden;
    position:fixed;
    top:0;
    width: 100%;
    min-width: 500px;
    background-color:#411159;
    color: white;
    margin: 0;
    z-index: 1;
}
.nav-link {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 15px 15px;
  text-decoration: none;
  font-size: 17px;
}
.nav-link:hover {
    background-color: #C15EF2;
    color: whitesmoke;
}
.router-link-exact-active {
    background-color: #8834B3;
    color: lightgrey;
    font-style: italic;
}
.profile {
    padding: 15px 15px;
    cursor: pointer;
}

</style>