import Vue from 'vue'
import Vuex from 'vuex'
import BillService from '../services/BillService';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    bills: [],
    activeMonth: null
  },
  getters: {
    paidBills(state) {
      return state.bills.filter(bill => bill.paid === true);
    },
    unpaidBills(state) {
      return state.bills.filter(bill => bill.paid === false);
    },
    billCount(state) {
      return state.bills.length;
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
    setActiveMonth(state, month){
      state.activeMonth = month;
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
    updateBillPaid({commit}, bill) {
      return new Promise((resolve, reject) => {
        BillService.updateBill(bill).then(resp => {
          console.log(resp);
          commit('updateBill', bill);
          resolve();
        }).catch(err => {
          console.log("Error updating bills: ", err.response);
          reject();
        });
      });
    },
    updateBillUndoPaid({commit}, bill) {
      return new Promise((resolve, reject) => {
        BillService.updateBill(bill).then(resp => {
          console.log(resp);
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
    }
  },
  modules: {
  }
})
