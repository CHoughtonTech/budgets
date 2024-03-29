import { createRouter, createWebHistory } from 'vue-router';
import { defineComponent } from 'vue';
import { getAuth, signOut } from 'firebase/auth';
import BillsDashboard from '@/views/BillsDashboard';
import BillsUpsert from '@/views/BillsUpsert';
import BudgetDashboard from '@/views/BudgetDashboard';
import ContactDashboard from '@/views/ContactDashboard';
import NotFoundPage from '@/views/NotFoundPage';
import PrivacyPolicy from '@/views/PrivacyPolicy';
import IncomeDashboard from '@/views/IncomeDashboard';
import IncomeUpsert from '@/views/IncomeUpsert';
import TermsAndConditions from '@/views/TermsOfUse';
import UserRegistration from '@/views/UserRegistration';
import UserProfile from '@/views/UserProfile';
import UserPasswordReset from '@/views/UserPasswordReset';
import KitchenSink from '@/views/KitchenSink.vue';

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
  },
  {
    path: '/register',
    name: 'user-registration',
    component: UserRegistration,
    props: true
  },
  {
    path: '/login',
    name: 'user-login',
    component: UserRegistration,
  },
  {
    path: '/profile',
    name: 'user-profile',
    component: UserProfile,
    props: true
  },
  {
    path: '/resetPassword',
    name: 'user-reset-password',
    props: true,
    component: UserPasswordReset,
  },
  {
    path: '/verifyCallback/:email',
    name: 'verify-callback',
    props: true,
    component: defineComponent({
      props: {
        email: null
      },
      mounted() {
        if (this.email) {
          const auth = getAuth();
          signOut(auth);
          this.$router.push('/login');
        } else {
          this.$router.push('/profile');
        }
      }

    }),
  },
  {
    path: '/privacypolicy',
    name: 'privacy-policy',
    component: PrivacyPolicy,
  },
  {
    path: '/termsandconditions',
    name: 'terms-and-conditions',
    component: TermsAndConditions,
  },
  {
    path: '/contact',
    name: 'contact-dashboard',
    component: ContactDashboard,
  },
  {
    path: '/kitchensink',
    name: 'kitchen-sink',
    component: KitchenSink,
  },
  {
    path: '/404',
    name: 'not-found-page',
    component: NotFoundPage,
    props: true,
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  }
]

const router = new createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default function registerRouter(app) {
  app.use(router);
  return router;
}
