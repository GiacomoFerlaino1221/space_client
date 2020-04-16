import Vue from 'vue';
import VueRouter from 'vue-router';

import Launcher from './views/launcher';
import Err from './views/error';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Err },
    { path: '/:id', name: 'laucher', component: Launcher },
    { path: '*', redirect: '/' }
  ]
});

export default router;