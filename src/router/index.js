import Vue from 'vue'
import VueRouter from 'vue-router'
import BudgetDashboard from '../views/BudgetDashboard';
import Bills from '../views/Bills';
import BillsCreate from '../views/BillsCreate';
import BillsEdit from '../views/BillsEdit';
import Income from '../views/Income';
import IncomeCreate from '../views/IncomeCreate';
import IncomeEdit from '../views/IncomeEdit';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'budget-dashboard',
    component: BudgetDashboard
  },
  {
    path: '/bills',
    name: 'bills',
    component: Bills
  },
  {
    path: '/bills/create',
    name: 'create-bill',
    component: BillsCreate
  },
  {
    path: '/bills/:id',
    name: 'edit-bill',
    component: BillsEdit,
    props: true
  },
  {
    path: '/income',
    name: 'income', 
    component: Income
  },
  {
    path: '/income/create',
    name: 'create-income',
    component: IncomeCreate
  },
  {
    path: '/income/:id',
    name: 'edit-income',
    component: IncomeEdit,
    props: true
  }
]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
