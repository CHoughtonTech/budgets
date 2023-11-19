import { defineStore } from 'pinia';
import { getDatabase } from 'firebase/database';
import BudgetService from '@/services/BudgetService';
import taxData from '@/api/TaxData';
import expenseCategories from '@/api/ExpenseCategories';
import states from '@/api/States';

const DEFAULT_USER_ID = 'oxsoftsolutions-budgets-notLoggedIn';

const ACTIVE_MONTH = {
  name: new Date().toLocaleString('default', { month: 'long' }),
  id: new Date().getMonth()
};

const rootState = {
  bills: [],
  income: [],
  categories: [],
  subCategories: [],
  states: [],
  federalTaxBrackets: [],
  stateTaxBrackets: [],
  ficaRate: [],
  budgets: [],
  user: null,
};

const mainStore = defineStore('main', {
  state: () => rootState,
  getters: {
    hasBills: (state) => state.bills && state.bills.length > 0,
    activeBills: (state) => {
      return state.bills.filter((bill) => {
        const isPaidOffThisMonth = new Date(bill.datePaidOff).getMonth() === ACTIVE_MONTH.id && new Date(bill.datePaidOff).getFullYear() === new Date().getFullYear();
        const isRecurringDueThisMonth = () => {
          if (!bill.isRecurring) {
            const createdDate = new Date(bill.dateCreated);
            const today = new Date();
            return createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear();
          };
          const dueDate = new Date(bill.recurringCycle.date ?? new Date().toLocaleDateString());
          const monthsSinceDue = Math.abs(dueDate.getMonth() - new Date().getMonth());
          return monthsSinceDue % bill.recurringCycle.interval === 0; 
        };

        if (isRecurringDueThisMonth()) updateDueDate(bill)

        return isRecurringDueThisMonth() && (bill.datePaidOff === null || bill.datePaidOff === '' || isPaidOffThisMonth);
      });
    },
    isStoreInitialized: (state) => {
      return state.federalTaxBrackets.length > 0 && state.stateTaxBrackets.length > 0 && state.states.length > 0 
        && state.categories.length > 0 && state.subCategories.length > 0 && state.ficaRate.length > 0;
    },
    activeBillCount: (state) => {
      return state.activeBills.length;
    },
    getSubCategoriesByCategoryId: (state) => (categoryId) => {
      if (categoryId === null) return [];
      return state.subCategories.filter(subCategory => subCategory.CategoryId == categoryId)
        .sort(function(a,b) { 
          let x = a.Name.toLowerCase();
          let y = b.Name.toLowerCase();
          if (x < y) { return -1; }
          if (x > y) { return 1; }
          return 0;
        });
    },
    getSubCategoryNameById: (state) => (subCategoryId) => {
      if (!subCategoryId || subCategoryId === null) return 'Unknown';
      const subCategory = state.subCategories.find(sc => sc.id === subCategoryId);
      return subCategory ? subCategory.Name : 'Unknown';
    },
    getCategoryNameById: (state) => (categoryId) => {
      if (!categoryId || categoryId == null) return 'Unknown';
      const subCategory = state.subCategories.find(sc => sc.id === categoryId);
      if (!subCategory) return 'Unknown';
      const category = state.categories.find(c => c.id === subCategory.CategoryId);
      return category ? category.Name : 'Unknown';
    },
    getUserId: (state)  => {
      if (!state.user || state.user === null) return DEFAULT_USER_ID;
      return state.user.uid;
    }
  },
  actions: {
    userConfirmedTOS(hasUserConfirmed) {
      if (this.user && this.getUserId !== DEFAULT_USER_ID)
        BudgetService.userConfirmedTOS(getDatabase(), this.user.uid, hasUserConfirmed);
    },
    setUser(user) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
    clearStore() {
      this.budgets = [];
      this.bills = [];
      this.income = [];
      this.categories = [];
      this.subCategories = [];
      this.states = [];
      this.federalTaxBrackets = [];
      this.stateTaxBrackets = [];
      this.ficaRate = [];
      this.user = null;
    },
    getBillById(id) {
      return new Promise((resolve, reject) => {
        const foundBill = this.bills.find(b => b.id === id);
        if (foundBill) resolve(foundBill);
        if (!foundBill) reject({ message: 'Bill not found for Id: ' + id});
      });
    },
    getUserBills() {
      if (!this.user || this.user === null) {
        this.bills = [];
        return;
      }
      BudgetService.getBills(getDatabase(), this.user.uid)
        .then((data) => {
          this.bills = data && data.length > 0 ? data : [];
        });
    },
    updateBill(bill) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertBill(getDatabase(), this.user.uid, bill);
        const index = this.bills.findIndex(x => x.id === bill.id);
        if (index > -1){
          this.bills[index] = bill;
          resolve();
        } else {
          reject();
        }
      });
    },
    deleteBill(billId) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.deleteBill(getDatabase(), this.user.uid, billId);
        const index = this.bills.findIndex(b => b.id === billId);
        if (index > -1) {
          this.bills.splice(index, 1);
          resolve();
        } else {
          reject();
        }
      });
    },
    createBill(bill) {
      return new Promise((resolve) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertBill(getDatabase(), this.user.uid, bill);
        this.bills.push(bill);
        resolve();
      });
    },
    getIncomeById(id) {
      return new Promise((resolve, reject) => {
        const foundIncome = this.income.find(i => i.id === id);
        if (foundIncome) resolve(foundIncome);
        if (!foundIncome) reject({ message: 'Income not found for Id: ' + id});
      });
    },
    getUserIncomes() {
      if (!this.user || this.user === null) {
        this.income = [];
        return;
      }
      BudgetService.getIncomes(getDatabase(), this.user.uid)
        .then((data) => {
          this.income = data && data.length > 0 ? data : [];
        });
    },
    createIncome(income) {
      return new Promise((resolve) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertIncome(getDatabase(), this.user.uid, income);
        this.income.push(income);
        resolve();
      });      
    },
    updateIncome(income) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertIncome(getDatabase(), this.user.uid, income);
        const index = this.income.findIndex(x => x.id === income.id);
        if (index > -1) {
          this.income[index] = income;
          resolve();
        } else {
          reject();
        }
      });
    },
    deleteIncome(incomeId) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
            BudgetService.deleteIncome(getDatabase(), this.user.uid, incomeId);
        const index = this.income.findIndex(i => i.id === incomeId);
        if (index > -1) {
          this.income.splice(index, 1);
          resolve();
        } else {
          reject();
        }
      });
    },
    createBudget(budget) {
      return new Promise((resolve) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertBudget(getDatabase(), this.user.uid, budget);
        this.budgets.push(budget);
        resolve();
      });
    },
    updateBudget(budget) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.upsertBudget(getDatabase(), this.user.uid, budget);
        const index = this.budgets.findIndex(x => x.id === budget.id);
        if (index > -1) {
          this.budgets[index] = budget;
          resolve();
        } else {
          reject();
        }
      })
    },
    deleteBudget(budgetId) {
      return new Promise((resolve, reject) => {
        if (this.getUserId !== DEFAULT_USER_ID)
          BudgetService.deleteBudget(getDatabase(), this.user.uid, budgetId)
        const index = this.budgets.findIndex(i => i.id === budgetId);
        if (index > -1) {
          this.budgets.splice(index, 1);
          resolve();
        } else {
          reject();
        }
      });
    },
    getBudgets() {
      if (!this.user || this.user === null) {
        this.budgets = [];
        return;
      }
      BudgetService.getBudgets(getDatabase(), this.user.uid)
        .then((data) => {
          this.budgets = data && data.length > 0 ? data : [];
        });
    },
    getBudgetById(id) {
      return new Promise((resolve, reject) => {
        const budget = this.budgets.find(b => b.id === id);
        if (budget) resolve(budget);
        if (!budget) reject({ message: 'Budget not found for Id: ' + id});
      });
    },
    initStore() {
      this.ficaRate = taxData.ficaTaxRate;
      this.federalTaxBrackets = taxData.federalTaxBracket;
      this.stateTaxBrackets = taxData.stateTaxBracket;
      this.categories = expenseCategories.categories;
      this.subCategories = expenseCategories.subCategories;
      this.states = states;
    }
  }
});

const updateDueDate = (b) => {
  const currentDueDate = new Date(b.dueDate);
  const newDueDate = new Date(b.dueDate);
  let isNewBillCycle = false;
  if (currentDueDate.getMonth() !== ACTIVE_MONTH.id) {
      isNewBillCycle = true;
      newDueDate.setMonth(ACTIVE_MONTH.id);
  }
  if (currentDueDate.getFullYear() !== new Date().getFullYear()) {
      isNewBillCycle = true;
      newDueDate.setFullYear(new Date().getFullYear());
  }
  if (isNewBillCycle) {
      b.dueDate = newDueDate.toLocaleDateString();
      b.paid = false;
      b.datePaid = null;
      mainStore().updateBill(b);
  }
}

export default mainStore;

// export type AppStore = ReturnType<typeof mainStore>;

// export const getDefaultState = () : typeof rootState => JSON.parse(
//   JSON.stringify(rootState);
// );