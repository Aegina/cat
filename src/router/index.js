import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
import { Routes } from './router';

const createRouter = () =>
  new VueRouter({
    mode: 'hash', // require service support
    linkExactActiveClass: 'active',
    scrollBehavior: (to, from, savedPosition) => savedPosition || { y: 0 },
    routes: Routes,
  });

const router = createRouter();
// 异步路由加载变动时调用，刷新路由列表。
// https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher;
}

export default router;
