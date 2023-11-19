import { createApp } from 'vue';
import App from './App';
import { initializeApp } from 'firebase/app';
import Datepicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';
import registerRouter from '@/router';
import { createPinia } from 'pinia'
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
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

const app = createApp(App);
registerRouter(app);

app.use(createPinia());
app.component('DatePicker', Datepicker);
app.mount('#app');
