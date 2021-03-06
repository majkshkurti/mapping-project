import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import './plugins/vuescroll';

import App from './App.vue';
import VueCookies from 'vue-cookies';
import VueLazyLoad from 'vue-lazyload';
import router from './router';
import store from './store/index';

import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.plugins.unregister(ChartDataLabels);

require('../node_modules/ol/ol.css');
require('./assets/scss/app.scss');
require('material-design-icons/iconfont/material-icons.css');

Vue.config.productionTip = false;

const appSelector = '#app';
const appEl = document.querySelector('#app');
Vue.prototype.$isEmbedded = appEl.hasAttribute('embedded');

Vue.use(VueLazyLoad);
Vue.use(VueCookies);

// App Configuration
// eslint-disable-next-line no-undef
fetch('./static/app-conf.json')
  .then(function(response) {
    if (response.status !== 200) {
      console.log(
        'Looks like there was a problem. Status Code: ' + response.status
      );
      return;
    }

    // Examine the text in the response
    response.json().then(function(data) {
      // Make app config accessible for all components
      Vue.prototype.$appConfig = data;
      new Vue({
        router,
        store,
        vuetify,
        render: h => h(App)
      }).$mount('#app');
    });
  })
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });

export { appSelector };
