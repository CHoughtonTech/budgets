import Vue from 'vue'
import Vuex from 'vuex'
import ExpenseCategories from '../api/ExpenseCategories';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    bills: [], //array of json objects
    activeMonth: null,
    categories: [],
    subCategories: [],
    editedBill: null
  },
  plugins: [createPersistedState()],
  getters: {
    paidBills(state) {
      let filteredArray = state.bills.filter(bill => bill.paid === true && (new Date(bill.dateCreated).getMonth() === state.activeMonth?.id || bill.isRecurring === true) && (bill.datePaidOff === null || bill.datePaidOff === ''));
      return filteredArray;
    },
    unpaidBills(state) {
      let filteredArray = state.bills.filter(bill => bill.paid === false && (new Date(bill.dateCreated).getMonth() === state.activeMonth?.id || bill.isRecurring === true) && (bill.datePaidOff === null || bill.datePaidOff === ''));
      return filteredArray;
    },
    hasBills(state) {
      return state.bills !== undefined && state.bills !== null && state.bills.length > 0;
    },
    activeBills(state) {
      return state.bills.filter(bill => (bill.isRecurring || new Date(bill.dateCreated).getMonth() === state.activeMonth?.id) && (bill.datePaidOff === null || bill.datePaidOff === ''));
    },
    activeBillCount(state) {
      let filteredBills = state.bills.filter(bill => (new Date(bill.dateCreated).getMonth() === state.activeMonth?.id || bill.isRecurring) && (bill.datePaidOff === null || bill.datePaidOff === ''))
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
    updateBill(state, bill) {
      state.bills.forEach(b => {
        if (b.id === bill.id) {
          b.name =  bill.name,
          b.paid =  bill.paid,
          b.amount =  parseFloat(bill.amount),
          b.datePaid =  bill.datePaid,
          b.dateCreated =  bill.dateCreated,
          b.isRecurring =  bill.isRecurring,
          b.paidCount =  bill.paidCount,
          b.isFixedAmount =  bill.isFixedAmount,
          b.datePaidOff =  bill.datePaidOff,
          b.subCategoryId  =  bill.subCategoryId,
          b.dueDate =  bill.dueDate
        }
      });
    },
    removeBill(state, index) {
      state.bills.splice(index,1);
    },
    createBill(state, bill) {
      state.bills.push(bill);
    },
    setEditedBill(state, bill) {
      state.editedBill = bill;
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
    getBillById({commit}, id) {
      let foundBill = this.state.bills.find(b => b.id === id);
      if(foundBill) {
        commit('setEditedBill', foundBill);
      }
    },
    updateBill({commit}, bill) {
      commit('updateBill', bill);
    },
    deleteBill({commit, state}, billId) {
      let billIndex = null;
      for (let i = 0; i < state.bills.length; i++) {
        const bill = state.bills[i];
        if(bill.id === billId) {
          billIndex = i;
          break;
        }
      }
      if (billIndex !== null) {
        commit('removeBill', billIndex);
      }
    },
    createBill({commit}, bill) {
      commit('createBill', bill);
    },
    getActiveMonth() {
      console.log(this.state.activeMonth);
    },
    updateActiveMonth({commit}, activeMonth) {
      commit('updateActiveMonth', activeMonth);
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
  }
})
