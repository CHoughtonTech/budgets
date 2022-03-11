import { createRouter, createWebHistory } from 'vue-router';
import BudgetDashboard from '../views/BudgetDashboard';
import BillsDashboard from '../views/BillsDashboard';
import BillsUpsert from '../views/BillsUpsert';
import IncomeDashboard from '../views/IncomeDashboard';
import IncomeUpsert from '../views/IncomeUpsert';

const routes = [
  {
    path: '/',
    name: 'budget-dashboard',
    component: BudgetDashboard
  },
  {
    path: '/bills',
    name: 'bills',
    component: BillsDashboard
  },
  {
    path: '/bills/create',
    name: 'create-bill',
    component: BillsUpsert,
    props: true
  },
  {
    path: '/bills/:billId',
    name: 'edit-bill',
    component: BillsUpsert,
    props: true
  },
  {
    path: '/income',
    name: 'income', 
    component: IncomeDashboard
  },
  {
    path: '/income/create',
    name: 'create-income',
    component: IncomeUpsert,
    props: true,
  },
  {
    path: '/income/:incomeId',
    name: 'edit-income',
    component: IncomeUpsert,
    props: true,
  }
]

const router = new createRouter({
  history: createWebHistory(),
  routes: routes
});

export default function registerRouter(app) {
  app.use(router);
  return router;
}
