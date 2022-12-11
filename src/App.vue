<script>
import NavBar from './components/NavBar';
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import mainStore from '@/store';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default defineComponent({
  components: {
    NavBar,
  },
  mounted() {
    const vuexStorage = localStorage.getItem('vuex');
    if (vuexStorage && vuexStorage !== null)
      localStorage.removeItem('vuex');
    if (!this.isStoreInitialized)
      this.initStore();
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        if (!this.user || this.user === null) {
          this.setUser(user);
          this.getUserIncomes();
          this.getUserBills();
        }
      } else {
        this.clearUser();
      }
    });
  },
  computed: {
    ...mapState(mainStore, ['user', 'isStoreInitialized']),
    currentYear() {
      return  new Date().getFullYear();
    },
    privacyPolicyLink() {
      let routeData = this.$router.resolve({ name: 'privacy-policy' });
      return routeData.href;
    },
    termsOfUseLink() {
      let routeData = this.$router.resolve({ name: 'terms-and-conditions' });
      return routeData.href;
    },
    contactUsLink() {
      let routeData = this.$router.resolve({ name: 'contact-dashboard' });
      return routeData.href;
    }
  },
  methods: {
    ...mapActions(mainStore, ['updateBill', 'setUser', 'clearUser', 'getUserIncomes', 'getUserBills', 'initStore']),
  }
});
</script>
<template>
  <div :class="$style['page-layout']">
    <NavBar :class="$style['nav-layout']" />
    <router-view :class="$style['main-content']"/>
    <hr/>
    <footer :class="$style['footer-layout']">
      <div :class="$style['footer-section']">&copy; {{currentYear}} OxSoft Budgets</div>
      <div :class="$style['footer-section']">
        <a :href="privacyPolicyLink">Privacy Policy</a> |
        <a :href="termsOfUseLink">Term of Use</a> |
        <a :href="contactUsLink">Contact Us</a>
      </div>
      <div :class="$style['footer-section']">
        <a href="https://www.vecteezy.com/free-vector/ox">Ox Vectors by Vecteezy</a> |
        <a target="_blank" href="https://icons8.com/icon/112554/bull">Bull</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
      </div>
    </footer>
  </div>
</template>
<style lang="scss" module>
@use 'assets/base.scss';
.page-layout {
  display: flex;
  flex-direction: column;
}
.nav-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.main-content {
  padding: 0 25px 25px;
  margin-top: 65px;
}
.footer-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}
.footer-section {
  color: $light-gray;
  font-size: $font-size-small;
  font-weight: $font-weight-semi-bold;
}
</style>