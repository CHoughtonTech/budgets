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
    if (this.activeMonth?.name !== this.currentMonth.name || this.activeMonth?.id !== this.currentMonth.id) {
        let promiseArr = [];
        if (this.hasBills) {
          this.bills.forEach(b => {
            if (b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === '')) {
              if (b.dueDate && b.dueDate !== null) {
                let currentDueDate = new Date(b.dueDate);
                let newDueDate = new Date(b.dueDate);
                if (currentDueDate.getMonth() !== this.currentMonth.id) {
                  newDueDate.setMonth(this.currentMonth.id);
                }
                if (currentDueDate.getFullYear() !== this.currentYear) {
                  newDueDate.setFullYear(this.currentYear);
                }
                b.dueDate = newDueDate.toLocaleDateString();
              }
              b.paid = false;
              b.datePaid = null;
            }
            promiseArr.push(this.updateBill(b));
          });
          Promise.all(promiseArr).then(() => {
            this.updateActiveMonth(this.currentMonth);
          });
        } else {
          this.updateActiveMonth(this.currentMonth);
        }
      }
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
    ...mapState(mainStore, ['activeMonth', 'user', 'bills', 'hasBills', 'isStoreInitialized']),
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
    ...mapActions(mainStore, ['updateActiveMonth', 'updateBill', 'setUser', 'clearUser', 'getUserIncomes', 'getUserBills', 'initStore']),
  },
  data() {
    return {
      currentMonth: {
          name: new Date().toLocaleString('default', { month: 'long' }),
          id: new Date().getMonth()
      }
    }
  }
});
</script>
<template>
  <div id="app">
    <NavBar/>
    <router-view id="main-view"/>
    <hr/>
    <div class="copyright">&copy; {{currentYear}} OxSoft Budgets</div>
    <div class="is-flex is-justify-content-center term-of-use">
      <a :href="privacyPolicyLink">Privacy Policy</a> &nbsp;|&nbsp; 
      <a :href="termsOfUseLink">Term of Use</a> &nbsp;|&nbsp; 
      <a :href="contactUsLink">Contact Us</a>
    </div>
    <div class="is-flex is-justify-content-center attribution-credit">
      <a href="https://www.vecteezy.com/free-vector/ox">Ox Vectors by Vecteezy</a> &nbsp;|&nbsp;
      <a target="_blank" href="https://icons8.com/icon/112554/bull">Bull</a> &nbsp;icon by&nbsp; <a target="_blank" href="https://icons8.com">Icons8</a>
    </div>
  </div>
</template>
<style>
html {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #2D3033;
}
body {
  margin: 0;
  font-family: "Open Sans", sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
#app {
  box-sizing: border-box;
  min-width: 500px;
  margin: 0 auto;
}
#main-view {
  margin-top: 60px;
  min-width: 500px;
  padding: 0 20px 20px;
  box-sizing: border-box;
}
hr {
  width: 100%;
  background-color: lightgrey;
  height: 1px;
}
a {
  color: #A755C2;
  font-weight: 600;
  background-color: transparent;
}
a:hover {
  color: whitesmoke;
}
img {
  border-style: none;
  width: 100%;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  display: flex;
  align-items: center;
  font-family: "Montserrat", sans-serif;
}
h1 {
  font-size: 50px;
  font-weight: 700;
}
h2 {
  font-size: 38px;
  font-weight: 700;
}
h3 {
  font-size: 28px;
  font-weight: 700;
}
h4 {
  font-size: 21px;
  font-weight: 700;
}
h5 {
  font-size: 16px;
  font-weight: 700;
}
h6 {
  font-size: 15px;
  font-weight: 700;
}
b,
strong {
  font-weight: bolder;
}
small {
  font-size: 80%;
}
.eyebrow {
  font-size: 20px;
}
.-text-primary {
  color: #A755C2;
}
.-text-base {
  color: lightgrey;
}
.-text-error {
  color: tomato;
}
.-text-gray {
  color: rgba(0, 0, 0, 0.5);
}
.-shadow {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.13);
}
.badge {
  display: inline-flex;
  height: 26px;
  width: auto;
  padding: 0 7px;
  margin: 0 5px;
  background: transparent;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 400;
  line-height: 26px;
}
.badge.-fill-gradient {
  background: linear-gradient(to right, #5f1192, #a26acf);
  color: #fff;
}
button,
label,
input,
optgroup,
select,
textarea {
  display: inline-flex;
  font-family: "Open sans", sans-serif;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
button,
input {
  overflow: visible;
}
button,
select {
  text-transform: none;
}
button,
[type="button"],
[type="reset"],
[type="submit"] {
  background-color: #411159;
  border: 1px solid #8834B3;
  color: white;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 10%;
}
button::-moz-focus-inner,
[type="button"]::-moz-focus-inner,
[type="reset"]::-moz-focus-inner,
[type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
button:-moz-focusring,
[type="button"]:-moz-focusring,
[type="reset"]:-moz-focusring,
[type="submit"]:-moz-focusring {
  outline: 2px solid #A755C2;
}
label {
  color: rgba(0, 0, 0, 0.5);
  font-weight: 700;
}
input,
textarea {
  box-sizing: border-box;
  border: solid 1px rgba(0, 0, 0, 0.4);
}
textarea {
  width: 100%;
  overflow: auto;
  font-size: 20px;
}
[type="checkbox"],
[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}
[type="number"]::-webkit-inner-spin-button,
[type="number"]::-webkit-outer-spin-button {
  height: auto;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}
[type="text"],
[type="number"],
[type="search"],
[type="password"] {
  height: 52px;
  width: 100%;
  padding: 0 10px;
  font-size: 20px;
}
[type="text"]:focus,
[type="number"]:focus,
[type="search"]:focus,
[type="password"]:focus {
  border-color: #A755C2;
}
::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}
[hidden] {
  display: none;
}
select {
  width: 100%;
  height: 52px;
  padding: 0 24px 0 10px;
  vertical-align: middle;
  background: #fff
    url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  background-size: 8px 10px;
  border: solid 1px rgba(0, 0, 0, 0.4);
  border-radius: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
select:focus {
  border-color: #A755C2;
  outline: 0;
}
select:focus::ms-value {
  color: #000;
  background: #fff;
}
select::ms-expand {
  opacity: 0;
}
.field-details {
  font-size: 12px;
  color: #411159;
}
.error-detail {
  font-size: 12px;
  color:crimson;
  font-style:italic;
  font-weight:500;
}
.error-detail-input {
  border-color: crimson;
  border-radius: 1px;
}
.copyright {
  color:lightgrey;
  text-align: center;
}
.term-of-use {
  color: #A755C2;
}
.attribution-credit {
  font-size:10px;
  color: #A755C2;
}
</style>