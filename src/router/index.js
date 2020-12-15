import Vue from 'vue';
import VueRouter from 'vue-router';
import Main from '../views/Main.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'map',
    redirect: '/gdp'
  },
  {
    path: '/stimulus',
    name: 'stimulus',
    component: Main
  },
  {
    path: '/gdp',
    name: 'gdp',
    component: Main
  },
  {
    path: '/unemployment',
    name: 'unemployment',
    component: Main
  }
];

const router = new VueRouter({
  routes
});


export default router;
