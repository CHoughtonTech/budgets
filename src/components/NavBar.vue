<template>
    <div id="nav" class="nav">
        <nav>
            <router-link class="nav-link" :to="{ name: 'budget-dashboard' }">Home</router-link>
            <router-link class="nav-link" :to="{ name: 'bills' }">Bills</router-link>
            <router-link class="nav-link" :to="{ name: 'income' }">Income</router-link>
        </nav>
        <div v-if="!triedLoggingIn" class="is-pulled-right profile" @click="toggleLoginTeaser()">
            <BaseIcon name="user">Login</BaseIcon>
        </div>
        <div v-else class="is-pulled-right profile" @click="toggleLoginTeaser()">
            <BaseIcon name="user-x">COMING SOON</BaseIcon>
        </div>
    </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue';
export default {
    components: {
        BaseIcon,
    },
    data() {
        return {
            triedLoggingIn: false,
        }  
    },
    methods: {
        toggleLoginTeaser() {
            this.triedLoggingIn = !this.triedLoggingIn;
        },
    },
}
</script>
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