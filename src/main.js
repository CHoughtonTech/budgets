import { createApp } from 'vue';
import App from './App';
import { initializeApp } from 'firebase/app';
import Datepicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';
import registerRouter from '@/router';
import store from './store'
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

const requireComponent = require.context(
  './components',
  false,
  /Base[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\/(.*)\.\w+/, '$1'))
  );

  return { componentName, componentConfig };
});

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: 'oxsoftsolutions.firebaseapp.com',
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: 'oxsoftsolutions.appspot.com',
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID,
};

console.log(firebaseConfig);

initializeApp(firebaseConfig);

const app = createApp(App);
registerRouter(app);

app.config.unwrapInjectedRef = true;
app.use(store);
app.component('DatePicker', Datepicker);
app.mount('#app');
