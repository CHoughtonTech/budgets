import Vue from 'vue'
import Vuex from 'vuex'
import BillService from '../services/BillService';
import ExpenseCategories from '../api/ExpenseCategories';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    bills: [],
    activeMonth: null,
    categories: [],
    subCategories: [],
    createdBill: null
  },
  getters: {
    paidBills(state) {
      let filteredArray = state.bills.filter(bill => bill.paid === true && (new Date(bill.dateCreated).getMonth() === state.activeMonth?.id || bill.isRecurring === true) && bill.datePaidOff === null);
      return filteredArray.sort(function(a,b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        if (x < y) { return -1 }
        if (x > y) { return 1 }
        return 0;
      });
    },
    unpaidBills(state) {
      let filteredArray = state.bills.filter(bill => bill.paid === false && (new Date(bill.dateCreated).getMonth() === state.activeMonth?.id || bill.isRecurring === true) && bill.datePaidOff === null);
      return filteredArray.sort(function(a,b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        if (x < y) { return -1 }
        if (x > y) { return 1 }
        return 0;
      });
    },
    activeBillCount(state) {
      let filteredBills = state.bills.filter(bill => new Date(bill.dateCreated).getMonth() === state.activeMonth.id && bill.datePaidOff === null)
      return filteredBills.length;
    },
    getSubCategoriesByCategoryId: (state) => (categoryId) => {
      if (categoryId !== null) {
        let filteredArray = state.subCategories.filter(subCategory => subCategory.CategoryId == categoryId);
        return filteredArray.sort(function(a,b) { 
          let x = a.Name.toLowerCase();
          let y = b.Name.toLowerCase();
          if (x < y) { return -1; }
          if (x > y) { return 1; }
          return 0;
        });
      } else {
        return [];
      }
    },
    getSubCategoryNameById: (state) => (subCategoryId) => {
      if (subCategoryId && subCategoryId !== null) {
        let found = state.subCategories.find(sc => sc.id === subCategoryId);
        if (found) {
          return found.Name;
        } else {
          return "Unknown";
        }
      } else {
        return "Unknown";
      }
    },
    getCategoryNameById: (state) => (categoryId) => {
      if (categoryId && categoryId !== null) {
        let foundSubCategory = state.subCategories.find(sc => sc.id === categoryId);
        if (foundSubCategory) {
          let foundCategory = state.categories.find(c => c.id === foundSubCategory.CategoryId)
          if (foundCategory) {
            return foundCategory.Name;
          } else {
            return "Unknown";
          }
        } else {
          return "Unknown";
        }
      } else {
        return "Unknown";
      }
    }
  },
  mutations: {
    setBills(state, bills) {
      state.bills = bills;
    },
    updateBill(state, bill) {
      state.bills.forEach(b => {
        if (b.id === bill.id) {
          b = bill;
        }
      });
    },
    removeBill(state, index) {
      state.bills.splice(index,1);
    },
    setCreatedBill(state, bill) {
      state.createdBill = bill;
    },
    setActiveMonth(state, month){
      state.activeMonth = month;
    },
    updateActiveMonth(state, month) {
      state.activeMonth = month;
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    setSubcategories(state, subcategories) {
      state.subCategories = subcategories;
    }
  },
  actions: {
    getAllBills({commit}) {
      return new Promise((resolve, reject) => {
        BillService.getBills().then(bills => {
          commit('setBills', bills.data);
          resolve();
        }).catch(err => {
          console.log("Error getting bills: ", err.response);
          reject();
        });
      });
    },
    updateBill({commit}, bill) {
      return new Promise((resolve, reject) => {
        BillService.updateBill(bill).then(() => {
          commit('updateBill', bill);
          resolve();
        }).catch(err => {
          console.log("Error updating bills: ", err.response);
          reject();
        });
      });
    },
    deleteBill({commit, state}, billId) {
      return new Promise((resolve, reject) => {
        BillService.deleteBill(billId).then(() => {
          let billIndex = null;
          for (let i = 0; i < state.bills.length; i++) {
            const bill = state.bills[i];
            if (bill.id === billId) {
              billIndex = i;
              break;
            }
          }
          commit('removeBill', billIndex);
          resolve();
        }).catch(err => {
          console.log("Error deleting bill: ", err.response);
          reject();
        });
      });
    },
    createBill({commit}, bill) {
      return new Promise((resolve, reject) => {
        BillService.createBill(bill).then(() => {
          commit('setCreatedBill', bill);
          resolve();
        }).catch(err => {
          console.log("Error creating bill: ", err.response);
          reject();
        });
      });
    },
    getActiveMonth({commit}) {
      return new Promise((resolve, reject) => {
        BillService.getActiveMonth().then(month => {
          commit('setActiveMonth', month.data);
          resolve();
        }).catch(err => {
          console.log("Error getting active month: ", err.response);
          reject();
        });
      });
    },
    updateActiveMonth({commit}, activeMonth) {
      return new Promise((resolve, reject) => {
        BillService.updateActiveMonth(activeMonth).then(() => {
          commit('updateActiveMonth', activeMonth);
          resolve();
        }).catch(err => {
          console.log("Error updating activeMonth: ", err.response);
          reject();
        });
      });
    },
    getCategories({commit}) {
      return new Promise((resolve) => {
        ExpenseCategories.getCategories(categories => {
          commit('setCategories', categories);
          resolve();
        });
      });
    },
    getSubcategories({commit}) {
      return new Promise((resolve) => {
        ExpenseCategories.getSubCategories(subcategories => {
          commit('setSubcategories', subcategories);
          resolve();
        });
      });
    }
  },
  modules: {
  }
})
