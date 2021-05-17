import Vue from 'vue'
import VueRouter from 'vue-router'
import BudgetDashboard from '../views/BudgetDashboard';
import Bills from '../views/Bills';
import BillsCreate from '../views/BillsCreate';
import BillsEdit from '../views/BillsEdit';

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
  }
]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
