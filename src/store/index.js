import { createStore } from 'vuex';
import ExpenseCategories from '../api/ExpenseCategories';
import createPersistedState from 'vuex-persistedstate';
import States from '../api/States';
import TaxData from '../api/TaxData';
import { getDatabase } from 'firebase/database';
import BudgetService from '@/services/BudgetService';

const DEFAULT_USER_ID = 'oxsoftsolutions-budgets-notLoggedIn';

const store = createStore({
  state: {
    bills: [],
    income: [],
    activeMonth: null,
    categories: [],
    subCategories: [],
    editedBill: null,
    editedIncome: null,
    states: [],
    federalTaxBrackets: [],
    stateTaxBrackets: [],
    ficaRate: [],
    user: null,
  },
  plugins: [createPersistedState()],
  getters: {
    getBills(state) {
      return state.bills;
    },
    hasBills(state) {
      return state.bills && state.bills.length > 0;
    },
    activeBills(state) {
      return state.bills.filter(bill => 
        (bill.isRecurring 
          || new Date(bill.dateCreated).getMonth() === state.activeMonth?.id && new Date(bill.dateCreated).getFullYear() === new Date().getFullYear()) 
        && (bill.datePaidOff === null 
            || bill.datePaidOff === '' 
            || (new Date(bill.datePaidOff).getMonth() === state.activeMonth?.id && new Date(bill.datePaidOff).getFullYear() === new Date().getFullYear())));
    },
    activeBillCount(state, getters) {
      return getters.activeBills.length;
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
          return 'Unknown';
        }
      } else {
        return 'Unknown';
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
            return 'Unknown';
          }
        } else {
          return 'Unknown';
        }
      } else {
        return 'Unknown';
      }
    },
    getFederalTaxes: (state) => {
      return state.federalTaxBrackets;
    },
    getStateTaxes: (state) => {
      return state.stateTaxBrackets;
    },
    getFICA: (state) => {
      return state.ficaRate;
    },
    getStates: (state) => {
      return state.states;
    },
    getIncomes: (state) =>{
      return state.income;
    },
    getUserName: (state) => {
      if (!state.user) return null;
      return state.user.displayName;
    },
    getEmail: (state) => {
      if (!state.user) return null;
      return state.user.email;
    },
    getUserPhoto: (state) => {
      if (!state.user) return null;
      return state.user.photoURL;
    },
    getUserId: (state) => {
      if (!state.user) return DEFAULT_USER_ID;
      return state.user.uid;
    }
  },
  mutations: {
    setBills(state, bills) {
      state.bills = bills;
    },
    updateBill(state, bill) {
      state.bills.forEach(b => {
        if (b.id === bill.id) {
          b.userId = bill.userId,
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
    setIncomes(state, income) {
      state.income = income;
    },
    createIncome(state, income) {
      state.income.push(income);
    },
    updateIncome(state, income) {
      state.income.forEach(i => {
        if (i.id === income.id) {
          i.userId = income.userId,
          i.name = income.name,
          i.type = income.type,
          i.salary = income.salary,
          i.netSalary = income.netSalary,
          i.hourlyRate = income.hourlyRate,
          i.hoursPerWeek = income.hoursPerWeek,
          i.employmentType = income.employmentType,
          i.filingStatus = income.filingStatus,
          i.payPeriod = income.payPeriod,
          i.state = income.state,
          i.isActive = income.isActive,
          i.isTaxExempt = income.isTaxExempt,
          i.deductions = income.deductions.map(d => { return d; })
        }
      });
    },
    removeIncome(state, index) {
      state.income.splice(index, 1);
    },
    foundIncome(state, income) {
      state.editedIncome = income;
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
    },
    setFederalTaxes(state, fedTaxes) {
      state.federalTaxBrackets = fedTaxes;
    },
    setStateTaxes(state, stateTaxes) {
      state.stateTaxBrackets = stateTaxes;
    },
    setFICARate(state, fica) {
      state.ficaRate = fica;
    },
    setStates(state, stateList) {
      state.states = stateList;
    },
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
    clearStore(state) {
      state.bills = [];
      state.income = [];
    }
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    userConfirmedTOS({commit}, hasUserConfirmed) {
      if (this.getters.getUserId !== DEFAULT_USER_ID)
        BudgetService.userConfirmedTOS(getDatabase(), this.state.user.uid, hasUserConfirmed);
    },
    setUser({commit}, user) {
      commit('setUser', user);
    },
    clearUser({commit}) {
      commit('clearUser');
    },
    clearStore({commit}) {
      commit('clearStore');
    },
    getBillById({commit}, id) {
      return new Promise((resolve, reject) => {
        let foundBill = this.state.bills.find(b => b.id === id);
        if(foundBill) {
          commit('setEditedBill', foundBill);
          resolve();
        } else {
          reject({ message: 'Bill not found for Id: ' + id});
        }
      });
    },
    getUserBills({commit}) {
      BudgetService.getBills(getDatabase(), this.state.user.uid)
        .then((bills) => {
          if (bills && bills.length > 0) {
            commit('setBills', bills);
          }
        });
    },
    updateBill({commit}, bill) {
      commit('updateBill', bill);
      if (this.getters.getUserId !== DEFAULT_USER_ID)
        BudgetService.upsertBill(getDatabase(), this.state.user.uid, bill);
    },
    deleteBill({commit, state}, billId) {
      const billIndex = state.bills.findIndex(b => b.id === billId);
      if (billIndex > -1) {
        commit('removeBill', billIndex);
        if (this.getters.getUserId !== DEFAULT_USER_ID)
          BudgetService.deleteBill(getDatabase(), this.state.user.uid, billId);
      }
    },
    createBill({commit}, bill) {
      commit('createBill', bill);
      if (this.getters.getUserId !== DEFAULT_USER_ID)
        BudgetService.upsertBill(getDatabase(), this.state.user.uid, bill);
    },
    getIncomeById({commit}, id) {
      return new Promise((resolve, reject) => {
        let foundIncome = this.state.income.find(i => i.id === id);
        if (foundIncome) {
          commit('foundIncome', foundIncome);
          resolve();
        } else {
          reject({ message: 'Income not found for Id: ' + id});
        }
      });
    },
    getUserIncomes({commit}) {
      BudgetService.getIncomes(getDatabase(), this.state.user.uid)
        .then((data) => {
          if (data && data.length > 0){
            commit('setIncomes', data);
          }
        });
    },
    createIncome({commit}, income) {
      commit('createIncome', income);
      BudgetService.upsertIncome(getDatabase(), this.state.user.uid, income);
    },
    updateIncome({commit}, income) {
      commit('updateIncome', income);
      BudgetService.upsertIncome(getDatabase(), this.state.user.uid, income);
    },
    deleteIncome({commit, state}, incomeId) {
      const index = state.income.findIndex(i => i.id === incomeId);
      if (index > -1) {
        BudgetService.deleteIncome(getDatabase(), this.state.user.uid, incomeId);
        commit('removeIncome', index);
      }
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
    },
    getStateData({commit}) {
      return new Promise((resolve) => {
        States.getAllStates(states => {
          commit('setStates', states);
          resolve();
        });
      });
    },
    getFederalTaxes({commit}) {
      return new Promise((resolve) => {
        TaxData.getFederalTaxBracket(federal => {
          commit('setFederalTaxes', federal);
          resolve();
        });
      });
    },
    getStateTaxes({commit}) {
      return new Promise((resolve) => {
        TaxData.getStateTaxBracket(state => {
          commit('setStateTaxes', state);
          resolve();
        });
      });
    },
    getFICARate({commit}) {
      return new Promise((resolve) => {
        TaxData.getFICATaxRate(fica => {
          commit('setFICARate', fica);
          resolve();
        });
      });
    }
  }
})

export default store;