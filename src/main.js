import Vue from 'vue';
import App from './App.vue';
import Meta from 'vue-meta';
import axios from 'axios';

import ElementUI from 'element-ui';

import html2canvas from 'html2canvas';
import 'element-ui/lib/theme-chalk/index.css';
import 'normalize.css/normalize.css'; // CSS resets

import './common/font/font.css';

import './style/index.scss';

import { L2Dwidget } from '../public/js/l2dwidget.min.js';

import router from './router';

Vue.use(Meta);
Vue.use(ElementUI, { size: 'mini' });

Vue.prototype.$axios = axios;
Vue.prototype.$html2canvas = html2canvas;
Vue.prototype.$L2Dwidget = L2Dwidget;

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
