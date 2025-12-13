import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { publicAxios, protectedAxios } from './axiosConfig';
import '@fortawesome/fontawesome-free/css/all.css';
import './assets/main.css';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);

// Axios global
app.config.globalProperties.$publicAxios = publicAxios;
app.config.globalProperties.$protectedAxios = protectedAxios;

app.use(router);
app.use(VueApexCharts);

app.mount('#app');
