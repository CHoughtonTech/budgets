<template>
  <div id="app">
    <NavBar/>
    <router-view id="main-view"/>
    <hr/>
    <div class="copyright">&copy; {{currentYear}} OxSoft Solutions</div>
  </div>
</template>

<script>
import NavBar from "./components/NavBar";

export default {
  components: {
    NavBar
  },
  created() {
    this.$store.dispatch("getCategories");
    this.$store.dispatch("getSubcategories");
    this.$store.dispatch("getStateData");
    this.$store.dispatch("getFederalTaxes");
    this.$store.dispatch("getStateTaxes");
    this.$store.dispatch("getFICARate");
    if (this.$store.state.activeMonth?.name !== this.currentMonth.name || this.$store.state.activeMonth?.id !== this.currentMonth.id) {
        let promiseArr = [];
        if (this.$store.getters.hasBills) {
          this.$store.state.bills.forEach(b => {
            if (b.isRecurring === true && (b.datePaidOff === null || b.datePaidOff === '')) {
              if (b.dueDate && b.dueDate !== null) {
                let currentDueDate = new Date(b.dueDate);
                let newDueDate = new Date(b.dueDate);
                if (currentDueDate.getMonth() < this.currentMonth.id) {
                  newDueDate.setMonth(currentDueDate.getMonth() + 1);
                }
                b.dueDate = newDueDate.toLocaleDateString();
              }
              b.paid = false;
              b.datePaid = null;
            }
            promiseArr.push(this.$store.dispatch("updateBill", b));
          });
          Promise.all(promiseArr).then(() => {
            this.$store.dispatch("updateActiveMonth", this.currentMonth);
          });
        } else {
          this.$store.dispatch("updateActiveMonth", this.currentMonth);
        }
      }
  },
  computed: {
    currentYear() {
      return  new Date().getFullYear();
    }
  },
  data() {
    return {
      currentMonth: {
          name: new Date().toLocaleString('default', { month: 'long' }),
          id: new Date().getMonth()
      }
    }
  }
}
</script>

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
</style>